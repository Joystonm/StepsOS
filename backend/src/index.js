import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../.env') });

const executions = new Map();
const wsClients = new Set();

function broadcast(event, data) {
  const message = JSON.stringify({ event, data });
  wsClients.forEach(ws => {
    if (ws.readyState === 1) ws.send(message);
  });
}

// Steps with self-documentation and production-grade contracts
const steps = {
  entry: {
    stepName: 'entry',
    stepDescription: 'Normalizes API input to canonical file format',
    inputSchema: { type: 'object', properties: { payload: 'object', user: 'object' } },
    outputSchema: { 
      type: 'object', 
      properties: { 
        fileId: 'string', 
        fileName: 'string', 
        fileSizeMB: 'number',
        fileType: 'string',
        uploadedBy: 'string',
        checksum: 'string'
      } 
    },
    execute: (input) => {
      console.log("🔥 ENTRY RECEIVED:", JSON.stringify(input));
      
      // Now receives direct input from runExecution
      return {
        fileId: input.fileId || 'unknown',
        fileName: input.fileName || 'unknown',
        fileSizeMB: input.fileSizeMB || 0,
        fileType: input.fileType || 'application/octet-stream',
        uploadedBy: input.uploadedBy || 'anonymous',
        checksum: input.checksum || 'pending'
      };
    }
  },
  
  validate: {
    stepName: 'validate',
    stepDescription: 'Validates file metadata against production contracts',
    inputSchema: { 
      type: 'object', 
      required: ['fileId', 'fileName', 'fileSizeMB', 'fileType', 'uploadedBy', 'checksum'],
      properties: { 
        fileId: 'string', 
        fileName: 'string', 
        fileSizeMB: 'number',
        fileType: 'string',
        uploadedBy: 'string',
        checksum: 'string'
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        file: 'object',
        validation: { type: 'object', properties: { status: 'string', rulesChecked: 'array' } }
      }
    },
    execute: (input) => {
      console.log("🔥 VALIDATE RECEIVED:", JSON.stringify(input));
      
      // 2️⃣ Step-Level Validation - Strict input checks
      // This will throw an error if validation fails
      validateFileUploadInput(input);
      
      // Only reach here if validation passes
      // Immutable processing - never mutate input
      return {
        file: {
          id: input.fileId,
          name: input.fileName,
          sizeMB: input.fileSizeMB,
          type: input.fileType,
          uploadedBy: input.uploadedBy,
          checksum: input.checksum
        },
        validation: {
          status: 'passed',
          rulesChecked: [
            'fileId_required', 
            'fileName_required', 
            'fileSizeMB_positive',
            'fileType_supported',
            'uploadedBy_required',
            'checksum_required'
          ],
          validatedAt: new Date().toISOString()
        }
      };
    }
  },
  
  process: {
    stepName: 'process',
    stepDescription: 'Processes validated files and generates artifacts',
    inputSchema: {
      type: 'object',
      required: ['validation'],
      properties: { validation: { type: 'object', properties: { status: 'string' } } }
    },
    outputSchema: {
      type: 'object',
      properties: {
        processing: { type: 'object', properties: { status: 'string', artifactId: 'string' } }
      }
    },
    execute: (input) => {
      console.log("🔥 PROCESS RECEIVED:", JSON.stringify(input));
      
      // Contract enforcement - check if validate step passed
      if (!input?.validation || input.validation.status !== 'passed') {
        throw new Error("validate Step failed");
      }
      
      // Pure processing result - immutable
      return {
        processing: {
          status: 'completed',
          processedAt: new Date().toISOString(),
          artifactId: `artifact_${Date.now()}`,
          summary: `Processed ${input.file?.name || 'unknown'} (${input.file?.sizeMB || 0}MB)`
        }
      };
    }
  }
};

function emitLog(level, event, step, data = {}) {
  const log = {
    level,
    event,
    step,
    timestamp: new Date().toISOString(),
    ...data
  };
  console.log(JSON.stringify(log));
  return log;
}

function validateExecutionContract(executionId, workflowId, input) {
  if (!executionId || typeof executionId !== 'string' || executionId.trim() === '') {
    throw new Error('executionId is required and must be a non-empty string');
  }
  
  if (!workflowId || typeof workflowId !== 'string' || workflowId.trim() === '') {
    throw new Error('Missing workflowId or input object');
  }
  
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Missing workflowId or input object');
  }
  
  return true;
}

function validateFileUploadInput(input) {
  const errors = [];
  
  // Field-level validation with specific error messages
  if (!input.fileId) {
    errors.push('fileId is required');
  } else if (typeof input.fileId !== 'string' || input.fileId.trim() === '') {
    errors.push('fileId must be non-empty string');
  }
  
  if (!input.fileName) {
    errors.push('fileName is required');
  } else if (typeof input.fileName !== 'string' || input.fileName.trim() === '') {
    errors.push('fileName must be non-empty string');
  }
  
  if (input.fileSizeMB === undefined || input.fileSizeMB === null) {
    errors.push('fileSizeMB is required');
  } else if (typeof input.fileSizeMB !== 'number') {
    errors.push('fileSizeMB must be a number');
  } else if (input.fileSizeMB <= 0) {
    errors.push('fileSizeMB must be > 0');
  }
  
  const supportedTypes = ['image/png', 'image/jpeg', 'image/gif'];
  if (!input.fileType) {
    errors.push('fileType is required');
  } else if (!supportedTypes.includes(input.fileType)) {
    errors.push('Unsupported fileType');
  }
  
  if (!input.uploadedBy) {
    errors.push('uploadedBy is required');
  } else if (typeof input.uploadedBy !== 'string' || input.uploadedBy.trim() === '') {
    errors.push('uploadedBy must be non-empty string');
  }
  
  if (input.checksum === undefined || input.checksum === null) {
    errors.push('checksum is required');
  } else if (typeof input.checksum !== 'string') {
    errors.push('checksum must be a string');
  }
  
  // If multiple errors, report all of them
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  return true;
}

async function runExecution(executionId, executionObj) {
  console.log("🚀 STARTING EXECUTION:", executionId, JSON.stringify(executionObj));
  
  // Extract actual input from execution object
  const actualInput = executionObj.input || executionObj;
  const workflowId = executionObj.workflowId || 'api::file-upload';
  
  // 1️⃣ EXECUTION CONTRACT GATE - Validate BEFORE any Step runs
  try {
    validateExecutionContract(executionId, workflowId, actualInput);
  } catch (error) {
    // Emit execution rejection log
    emitLog('error', 'execution.rejected', 'execution', { 
      status: 'failed',
      reason: error.message 
    });
    
    // Create rejected execution record
    const execution = { 
      id: executionId, 
      status: 'rejected', 
      reason: error.message,
      steps: [{
        name: 'execution',
        status: 'failed',
        logs: [`Execution rejected: ${error.message}`]
      }]
    };
    executions.set(executionId, execution);
    
    broadcast('execution:rejected', { executionId, reason: error.message });
    throw error;
  }
  
  const execution = { id: executionId, steps: [], status: 'running' };
  executions.set(executionId, execution);
  
  let currentInput = actualInput;  // Use extracted input
  let previousStepFailed = false;
  
  for (const stepName of ['entry', 'validate', 'process']) {
    // 4️⃣ Skip downstream steps if previous step failed
    if (previousStepFailed && stepName !== 'entry') {
      const skipReason = stepName === 'process' ? 'validate Step failed' : 'Previous step failed';
      const skipLog = emitLog('info', 'step.skipped', stepName, {
        status: 'skipped',
        reason: skipReason
      });
      
      execution.steps.push({
        name: stepName,
        status: 'skipped',
        logs: [`Step ${stepName} skipped: ${skipReason}`]
      });
      
      broadcast('step:skipped', { executionId, step: stepName });
      continue;
    }
    
    // 2️⃣ Step-Level Validation - Only run if execution is accepted
    emitLog('info', 'step.started', stepName);
    
    try {
      console.log(`Running ${stepName} with:`, currentInput);
      const step = steps[stepName];
      currentInput = step.execute(currentInput);
      
      const successLog = emitLog('info', 'step.completed', stepName, { 
        status: 'success',
        validatedAt: stepName === 'validate' ? new Date().toISOString() : undefined
      });
      
      execution.steps.push({ 
        name: stepName, 
        status: 'completed', 
        output: currentInput,
        logs: [`Step ${stepName} completed successfully at ${successLog.timestamp}`],
        metadata: {
          stepName: step.stepName,
          description: step.stepDescription,
          inputSchema: step.inputSchema,
          outputSchema: step.outputSchema
        }
      });
      broadcast('step:complete', { executionId, step: stepName, output: currentInput });
    } catch (error) {
      const failureLog = emitLog('error', 'step.failed', stepName, { 
        status: 'failed', 
        reason: error.message 
      });
      
      execution.steps.push({ 
        name: stepName, 
        status: 'failed', 
        error: error.message,
        logs: [
          `Step ${stepName} failed at ${failureLog.timestamp}`,
          `Reason: ${error.message}`
        ]
      });
      
      previousStepFailed = true;
      execution.status = 'failed';
      broadcast('execution:failed', { executionId, error: error.message });
      
      // Continue to next iteration to skip remaining steps
      continue;
    }
  }
  
  if (!previousStepFailed) {
    execution.status = 'completed';
    broadcast('execution:complete', { executionId });
  }
}

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/execute' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const input = JSON.parse(body);
        const executionId = `exec_${Date.now()}`;
        
        runExecution(executionId, input).catch(console.error);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accepted: true, executionId }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accepted: false, error: error.message }));
      }
    });
    return;
  }

  if (req.url === '/executions' && req.method === 'GET') {
    const allExecutions = Array.from(executions.values());
    const latest = allExecutions[allExecutions.length - 1];
    
    // 4️⃣ Graph Behavior - Show execution state accurately
    let graph;
    if (latest?.status === 'rejected') {
      graph = {
        nodes: [
          { id: 'execution', type: 'entry', status: 'failed', x: 400, y: 220 }
        ],
        edges: []
      };
    } else if (latest?.steps) {
      // Build graph from actual execution state
      const stepStates = {};
      latest.steps.forEach(step => {
        stepStates[step.name] = step.status;
      });
      
      graph = {
        nodes: [
          { id: 'entry', type: 'entry', status: stepStates.entry || 'pending', x: 400, y: 100 },
          { id: 'validate', type: 'workflow', status: stepStates.validate || 'pending', x: 400, y: 220 },
          { id: 'process', type: 'workflow', status: stepStates.process || 'pending', x: 400, y: 340 }
        ],
        edges: [
          { from: 'entry', to: 'validate' },
          { from: 'validate', to: 'process' }
        ]
      };
    } else {
      // Default pending graph
      graph = {
        nodes: [
          { id: 'entry', type: 'entry', status: 'pending', x: 400, y: 100 },
          { id: 'validate', type: 'workflow', status: 'pending', x: 400, y: 220 },
          { id: 'process', type: 'workflow', status: 'pending', x: 400, y: 340 }
        ],
        edges: [
          { from: 'entry', to: 'validate' },
          { from: 'validate', to: 'process' }
        ]
      };
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      executions: allExecutions.map(e => ({
        id: e.id,
        status: e.status,
        reason: e.reason,
        steps: e.steps || []
      })),
      graph
    }));
    return;
  }

  // Get execution graph with data lineage
  if (req.url.startsWith('/api/executions/') && req.url.endsWith('/graph') && req.method === 'GET') {
    const executionId = req.url.split('/')[3];
    const execution = executions.get(executionId);
    
    if (!execution) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Execution not found' }));
      return;
    }
    
    // Build execution graph with data lineage
    const executionGraph = {
      nodes: [],
      edges: [],
      metadata: {
        executionId,
        status: execution.status,
        startTime: execution.startTime,
        endTime: execution.endTime
      }
    };
    
    // Convert steps to graph nodes with input/output data
    if (execution.steps) {
      execution.steps.forEach((step, index) => {
        executionGraph.nodes.push({
          id: step.name,
          type: 'step',
          status: step.status,
          input: step.input,
          output: step.output,
          error: step.error,
          logs: step.logs,
          x: 400,
          y: 100 + (index * 120)
        });
        
        // Add edges between consecutive steps
        if (index > 0) {
          executionGraph.edges.push({
            from: execution.steps[index - 1].name,
            to: step.name
          });
        }
      });
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, graph: executionGraph }));
    return;
  }

  // Step-specific AI Analysis endpoint
  if (req.url === '/ai/analyze-step' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { executionId, stepId, stepData } = JSON.parse(body);
        const execution = executions.get(executionId);
        
        if (!execution) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Execution not found' }));
          return;
        }
        
        // Use the step data provided by frontend
        const analysisData = {
          executionId,
          stepId,
          stepData: stepData || {}
        };
        
        // Call AI for step analysis
        const analysis = await analyzeStepWithGroq(analysisData);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { analysis } }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // AI Analysis endpoint
  if (req.url === '/ai/analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { executionId } = JSON.parse(body);
        const execution = executions.get(executionId);
        
        if (!execution) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Execution not found' }));
          return;
        }
        
        // Prepare execution data for AI analysis
        const executionSummary = {
          status: execution.status,
          steps: execution.steps.map(step => ({
            name: step.name,
            status: step.status,
            error: step.error,
            logs: step.logs?.slice(0, 3) // Limit logs for brevity
          }))
        };
        
        // Call Groq AI for analysis
        const analysis = await analyzeExecutionWithGroq(executionSummary);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { analysis } }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  if (req.url?.startsWith('/steps/')) {
    const stepId = req.url.split('/')[2];
    const latest = Array.from(executions.values()).pop();
    const step = latest?.steps.find(s => s.name === stepId);
    const stepDef = steps[stepId];
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: stepId,
      name: stepDef?.stepName || stepId,
      description: stepDef?.stepDescription || 'No description',
      status: step?.status || 'pending',
      input: step?.output || {},
      output: step?.output || {},
      metadata: step?.metadata || {
        inputSchema: stepDef?.inputSchema || {},
        outputSchema: stepDef?.outputSchema || {}
      },
      logs: step?.logs || (latest?.status === 'rejected' && stepId === 'execution' ? 
        [`Execution rejected: ${latest.reason}`] : ['No execution data'])
    }));
    return;
  }

  // Auto-recovery endpoint
  if (req.url === '/ai/auto-recovery' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { executionId, stepId, stepData } = JSON.parse(body);
        
        const suggestion = await generateAutoRecovery(stepData);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { suggestion } }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // AI Chat endpoint
  if (req.url === '/ai/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { executionId, stepId, message, context } = JSON.parse(body);
        
        const response = await generateChatResponse(message, context);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { response } }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // AI Improvements endpoint
  if (req.url === '/ai/improvements' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { executionId, stepId, stepData } = JSON.parse(body);
        
        const suggestions = await generateImprovements(stepData);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { suggestions } }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  wsClients.add(ws);
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    wsClients.delete(ws);
  });
  ws.on('error', (error) => {
    console.error('🔌 WebSocket error:', error);
    wsClients.delete(ws);
  });
  ws.send(JSON.stringify({ event: 'connected', data: { message: 'Connected to StepsOS' } }));
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('❌ Port 8080 is already in use. Please stop the other service or use a different port.');
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Groq AI Analysis Function
async function analyzeExecutionWithGroq(executionData) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return generateMockAnalysis(executionData);
    }

    const prompt = `Analyze this workflow execution data and provide a brief summary:

Execution Status: ${executionData.status}
Total Steps: ${executionData.steps.length}
Completed Steps: ${executionData.steps.filter(s => s.status === 'completed').length}
Failed Steps: ${executionData.steps.filter(s => s.status === 'failed').length}

Step Details:
${executionData.steps.map(step => `- ${step.name}: ${step.status} ${step.error ? `(Error: ${step.error})` : ''}`).join('\n')}

Please provide a concise analysis focusing on:
1. Overall execution status
2. Any issues or failures
3. Performance insights
4. Recommendations

Keep the response under 150 words.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that analyzes workflow executions. Provide concise, actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Analysis completed but no content returned.';
  } catch (error) {
    console.error('Groq API error:', error);
    return generateMockAnalysis(executionData);
  }
}

function generateMockAnalysis(executionData) {
  const failedSteps = executionData.steps.filter(step => step.status === 'failed');
  const completedSteps = executionData.steps.filter(step => step.status === 'completed');
  
  if (failedSteps.length > 0) {
    const failedStep = failedSteps[0];
    return `Execution failed at ${failedStep.name} step. ${failedStep.error || 'Validation error detected'}. Recommend checking input data format and validation rules before retrying.`;
  } else if (executionData.status === 'completed') {
    return `Execution completed successfully with ${completedSteps.length} steps processed. All validation checks passed and data was processed without issues. System is operating normally.`;
  } else {
    return `Execution is ${executionData.status}. ${completedSteps.length} steps completed so far. Monitor for completion or check for any blocking issues.`;
  }
}

// Step-specific AI Analysis Function
async function analyzeStepWithGroq(stepData) {
  try {
    console.log('🤖 Groq API Key present:', !!process.env.GROQ_API_KEY);
    if (!process.env.GROQ_API_KEY) {
      console.log('🤖 Using mock analysis - no API key');
      return generateStepAnalysis(stepData);
    }

    const prompt = `Analyze this workflow step and provide a brief, structured summary:

Step: ${stepData.stepId || 'Unknown'}
Status: ${stepData.stepData?.status || 'unknown'}
Input: ${JSON.stringify(stepData.stepData?.input || {})}
Output: ${JSON.stringify(stepData.stepData?.output || {})}
Error: ${stepData.stepData?.error || 'none'}
Logs: ${stepData.stepData?.logs?.length || 0} entries

Provide analysis in this exact format:
• Status: [brief status description]
• Issue: [main problem if any, or "None"]
• Recommendation: [one actionable suggestion]

Keep response under 100 words, no markdown formatting.`;

    console.log('🤖 Calling Groq API...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that analyzes workflow execution data. Provide concise, actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('🤖 Groq API error details:', errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || 'Analysis completed but no content returned.';
    console.log('🤖 Groq analysis received:', analysis.substring(0, 100) + '...');
    return `🤖 GROQ AI: ${analysis}`;
  } catch (error) {
    console.error('🤖 Groq API error:', error.message);
    console.log('🤖 Falling back to mock analysis');
    return `📝 MOCK: ${generateStepAnalysis(stepData)}`;
  }
}

function generateStepAnalysis(stepData) {
  const steps = stepData.steps;
  const failedSteps = steps.filter(step => step.status === 'failed');
  const completedSteps = steps.filter(step => step.status === 'completed');
  
  if (failedSteps.length > 0) {
    const failedStep = failedSteps[0];
    const inputSummary = failedStep.input ? Object.keys(failedStep.input).join(', ') : 'No input';
    const outputSummary = failedStep.output ? 'Partial output generated' : 'No output produced';
    
    return `Step "${failedStep.name}" failed during execution. Input: ${inputSummary}. ${outputSummary}. Error: ${failedStep.error || 'Unknown error'}. Logs indicate ${failedStep.logs?.length || 0} events. Recommendation: Verify input data and retry execution.`;
  } else if (stepData.status === 'completed') {
    const totalInputFields = steps.reduce((acc, step) => acc + (step.input ? Object.keys(step.input).length : 0), 0);
    const totalOutputFields = steps.reduce((acc, step) => acc + (step.output ? Object.keys(step.output).length : 0), 0);
    
    return `All ${steps.length} steps completed successfully. Processed ${totalInputFields} input fields and generated ${totalOutputFields} output fields. Data transformation pipeline executed without errors. System performance is optimal.`;
  } else {
    return `Execution in progress: ${completedSteps.length}/${steps.length} steps completed. Current status: ${stepData.status}. Monitor remaining steps for completion.`;
  }
}

// Auto-recovery AI function
async function generateAutoRecovery(stepData) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return generateMockRecovery(stepData);
    }

    const prompt = `This workflow step failed. Generate a specific fix:

Step: ${stepData.name}
Status: ${stepData.status}
Error: ${stepData.error}
Input: ${JSON.stringify(stepData.input)}

Provide a concise fix suggestion in this format:
**Issue:** [brief problem description]
**Fix:** [specific solution]
**Code:** [any code changes needed]

Keep under 150 words.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a workflow debugging expert. Provide specific, actionable fixes.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Auto-recovery analysis unavailable.';
  } catch (error) {
    console.error('Auto-recovery error:', error);
    return generateMockRecovery(stepData);
  }
}

// Chat response AI function
async function generateChatResponse(message, context) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return `I understand you're asking about "${message}". This step ${context?.status || 'has issues'}. Let me help you debug this workflow step.`;
    }

    const prompt = `User question: "${message}"

Context - Step: ${context?.name}, Status: ${context?.status}, Error: ${context?.error}
Input: ${JSON.stringify(context?.input || {})}
Output: ${JSON.stringify(context?.output || {})}

Provide a helpful, conversational response. Be specific and actionable. Keep under 100 words.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant for workflow debugging. Be conversational and specific.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I cannot provide a response right now.';
  } catch (error) {
    console.error('Chat response error:', error);
    return `I understand you're asking about "${message}". Let me help you with this workflow step issue.`;
  }
}

// Mock recovery for fallback
function generateMockRecovery(stepData) {
  if (stepData.error?.includes('Unsupported fileType')) {
    return `**Issue:** File type validation failed\n**Fix:** Update validation rules to support ${stepData.input?.fileType}\n**Code:** Add "${stepData.input?.fileType}" to allowed file types array`;
  }
  return `**Issue:** Step "${stepData.name}" failed\n**Fix:** Check input data format and validation rules\n**Code:** Review step configuration and retry`;
}

// Improvements generation function
async function generateImprovements(stepData) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return generateMockImprovements(stepData);
    }

    const prompt = `Suggest improvements for this workflow step:

Step: ${stepData.name}
Status: ${stepData.status}
Input: ${JSON.stringify(stepData.input)}
Output: ${JSON.stringify(stepData.output)}

Provide 2-3 specific improvement suggestions focusing on:
- Performance optimization
- Error handling
- Data validation
- User experience

Format as simple bullet points, keep each under 50 words.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a workflow optimization expert. Provide specific, actionable improvements.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    return content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•')).map(line => line.replace(/^[-•]\s*/, ''));
  } catch (error) {
    console.error('Improvements error:', error);
    return generateMockImprovements(stepData);
  }
}

// Mock improvements for fallback
function generateMockImprovements(stepData) {
  const improvements = [
    'Add input validation with detailed error messages',
    'Implement retry logic with exponential backoff',
    'Add progress indicators for long-running operations'
  ];
  
  if (stepData.status === 'failed') {
    improvements.push('Add fallback processing for unsupported file types');
  }
  
  return improvements.slice(0, 3);
}

server.listen(8080, () => {
  console.log('✅ StepsOS Backend running on http://localhost:8080');
  console.log('🔌 WebSocket server ready on ws://localhost:8080');
  console.log('📊 Available endpoints:');
  console.log('   GET  /executions - List all executions');
  console.log('   POST /execute    - Start new execution');
  console.log('   GET  /step/:id   - Get step details');
});
