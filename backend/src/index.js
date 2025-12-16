import { createServer } from 'http';
import { WebSocketServer } from 'ws';

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

server.listen(8080, () => {
  console.log('✅ StepsOS Backend running on http://localhost:8080');
  console.log('🔌 WebSocket server ready on ws://localhost:8080');
  console.log('📊 Available endpoints:');
  console.log('   GET  /executions - List all executions');
  console.log('   POST /execute    - Start new execution');
  console.log('   GET  /step/:id   - Get step details');
});
