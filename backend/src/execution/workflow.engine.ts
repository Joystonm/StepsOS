import { logger } from '../utils/logger.js';
import { eventsStream } from '../streaming/events.stream.js';

export interface WorkflowInput {
  workflowId: string;
  executionId: string;
  input: any;
}

export interface StepExecution {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: any;
  output?: any;
  error?: string;
  startTime?: string;
  endTime?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  steps: Map<string, StepExecution>;
  graph: {
    nodes: Array<{
      id: string;
      type: string;
      status: string;
      x: number;
      y: number;
    }>;
    edges: Array<{
      from: string;
      to: string;
    }>;
  };
  startTime: string;
  endTime?: string;
}

class WorkflowEngine {
  private executions = new Map<string, WorkflowExecution>();
  
  async executeWorkflow(workflowInput: WorkflowInput): Promise<WorkflowExecution> {
    const { workflowId, executionId, input } = workflowInput;
    
    logger.info(`Starting workflow execution: ${executionId}`);
    
    // Create execution instance
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      input,
      steps: new Map(),
      graph: this.createInitialGraph(workflowId, input),
      startTime: new Date().toISOString()
    };
    
    this.executions.set(executionId, execution);
    
    // Execute workflow steps
    try {
      await this.executeSteps(execution);
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date().toISOString();
      logger.error(`Workflow execution failed: ${executionId}`, error);
    }
    
    return execution;
  }
  
  private createInitialGraph(workflowId: string, input: any) {
    // Create graph based on workflow type
    if (workflowId === 'wf_file_processing') {
      return {
        nodes: [
          { id: 'start', type: 'entry', status: 'completed', x: 400, y: 100 },
          { id: 'validate', type: 'workflow', status: 'pending', x: 400, y: 220 },
          { id: 'process', type: 'workflow', status: 'pending', x: 400, y: 340 }
        ],
        edges: [
          { from: 'start', to: 'validate' },
          { from: 'validate', to: 'process' }
        ]
      };
    }
    
    // Default graph
    return {
      nodes: [
        { id: 'start', type: 'entry', status: 'completed', x: 400, y: 100 },
        { id: 'validate', type: 'workflow', status: 'pending', x: 400, y: 220 },
        { id: 'process', type: 'workflow', status: 'pending', x: 400, y: 340 }
      ],
      edges: [
        { from: 'start', to: 'validate' },
        { from: 'validate', to: 'process' }
      ]
    };
  }
  
  private async executeSteps(execution: WorkflowExecution) {
    const stepOrder = ['start', 'validate', 'process'];
    let currentInput = execution.input;
    
    for (const stepId of stepOrder) {
      if (stepId === 'start') {
        // Start step just passes input through
        const stepExecution: StepExecution = {
          id: stepId,
          name: stepId,
          status: 'completed',
          input: currentInput,
          output: currentInput,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString()
        };
        
        execution.steps.set(stepId, stepExecution);
        continue;
      }
      
      // Update graph to show step as running
      this.updateStepStatus(execution, stepId, 'running');
      eventsStream.emit('graph:update', { graph: execution.graph });
      
      const stepExecution: StepExecution = {
        id: stepId,
        name: stepId,
        status: 'running',
        input: currentInput,
        startTime: new Date().toISOString()
      };
      
      execution.steps.set(stepId, stepExecution);
      
      try {
        // Execute step
        const output = await this.executeStep(stepId, currentInput);
        
        stepExecution.status = 'completed';
        stepExecution.output = output;
        stepExecution.endTime = new Date().toISOString();
        
        // Update graph
        this.updateStepStatus(execution, stepId, 'completed');
        eventsStream.emit('step:complete', { 
          stepId, 
          status: 'completed',
          output,
          timestamp: new Date().toISOString() 
        });
        
        currentInput = output;
        
        // Add delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        stepExecution.status = 'failed';
        stepExecution.error = error instanceof Error ? error.message : 'Unknown error';
        stepExecution.endTime = new Date().toISOString();
        
        this.updateStepStatus(execution, stepId, 'failed');
        throw error;
      }
      
      eventsStream.emit('graph:update', { graph: execution.graph });
    }
  }
  
  private async executeStep(stepId: string, input: any): Promise<any> {
    logger.info(`Executing step: ${stepId}`);
    
    switch (stepId) {
      case 'validate':
        return this.validateStep(input);
      case 'process':
        return this.processStep(input);
      default:
        throw new Error(`Unknown step: ${stepId}`);
    }
  }
  
  private async validateStep(input: any): Promise<any> {
    // Simulate validation logic
    if (!input.fileId || !input.checksum) {
      throw new Error('Missing required fields: fileId or checksum');
    }
    
    return {
      ...input,
      validated: true,
      validatedAt: new Date().toISOString()
    };
  }
  
  private async processStep(input: any): Promise<any> {
    // Simulate processing logic
    return {
      ...input,
      processed: true,
      processedAt: new Date().toISOString(),
      result: `Processed file ${input.fileId} with checksum ${input.checksum}`
    };
  }
  
  private updateStepStatus(execution: WorkflowExecution, stepId: string, status: string) {
    execution.graph.nodes = execution.graph.nodes.map(node =>
      node.id === stepId ? { ...node, status } : node
    );
  }
  
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }
  
  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }
  
  getStepDetails(executionId: string, stepId: string): StepExecution | undefined {
    const execution = this.executions.get(executionId);
    return execution?.steps.get(stepId);
  }
}

export const workflowEngine = new WorkflowEngine();
