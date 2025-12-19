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

function analyzeStep(stepData) {
  const step = stepData.stepData || stepData;
  const stepName = step.name || 'unknown';
  const status = step.status || 'unknown';
  const error = step.error || 'None';
  
  if (status === 'failed') {
    return `❌ ${stepName} step failed: ${error}

💡 Quick Fix: ${error.includes('fileType') ? 'Use supported file types: PNG, JPEG, GIF, PDF' : 'Check input validation rules'}

📋 Input Issues: ${error.includes('fileType') ? 'Unsupported file format detected' : 'Validation failed'}`;
  } else {
    return `✅ ${stepName} step completed successfully

📊 Status: All validation checks passed
🎯 Result: Data processed without issues`;
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

  if (req.url === '/ai/analyze-step' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const stepData = JSON.parse(body);
      const analysis = analyzeStep(stepData);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true,
        data: { 
          data: {
            analysis: analysis 
          }
        }
      }));
    });
    return;
  }

  if (req.url === '/ai/auto-recovery' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true,
        data: {
          suggestion: 'Check input validation and retry with correct data format'
        }
      }));
    });
    return;
  }

  if (req.url === '/ai/improvements' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true,
        data: {
          suggestions: [
            'Add comprehensive input validation',
            'Implement proper error handling',
            'Add detailed logging for debugging',
            'Consider retry mechanisms for failed steps',
            'Optimize step performance'
          ]
        }
      }));
    });
    return;
  }

  if (req.url === '/execute' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const requestData = JSON.parse(body);
      const input = requestData.input || requestData;
      const executionId = `exec_${Date.now()}`;
      
      const supportedTypes = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'];
      let validationError = null;
      
      // Check fileId
      if (!input.fileId || input.fileId.trim() === '') {
        validationError = 'fileId is required';
      }
      // Check fileName
      else if (!input.fileName || input.fileName.trim() === '') {
        validationError = 'fileName is required';
      }
      // Check fileSizeMB
      else if (input.fileSizeMB === undefined || input.fileSizeMB === null) {
        validationError = 'fileSizeMB is required';
      }
      else if (typeof input.fileSizeMB !== 'number') {
        validationError = 'fileSizeMB must be a number';
      }
      else if (input.fileSizeMB <= 0) {
        validationError = 'fileSizeMB must be > 0';
      }
      // Check fileType
      else if (!input.fileType) {
        validationError = 'fileType is required';
      }
      else if (!supportedTypes.includes(input.fileType)) {
        validationError = 'Unsupported fileType';
      }
      // Check uploadedBy
      else if (!input.uploadedBy || input.uploadedBy.trim() === '') {
        validationError = 'uploadedBy is required';
      }
      // Check checksum
      else if (!input.checksum || input.checksum.trim() === '') {
        validationError = 'checksum is required';
      }
      
      const execution = {
        id: executionId,
        status: validationError ? 'failed' : 'completed',
        steps: [
          {
            name: 'entry',
            status: 'completed',
            input: input,
            output: input,
            logs: ['Step entry completed successfully']
          },
          {
            name: 'validate',
            status: validationError ? 'failed' : 'completed',
            input: input,
            output: validationError ? null : { validation: { status: 'passed' } },
            error: validationError,
            logs: validationError ? 
              [`Step validate failed`, `Reason: ${validationError}`] :
              ['Step validate completed successfully']
          },
          ...(validationError ? [] : [{
            name: 'process',
            status: 'completed',
            input: { validation: { status: 'passed' } },
            output: {
              processing: {
                status: 'completed',
                processedAt: new Date().toISOString(),
                artifactId: `artifact_${Date.now()}`,
                summary: `Processed ${input.fileName} (${input.fileSizeMB}MB)`
              }
            },
            logs: ['Step process completed successfully']
          }])
        ]
      };
      
      executions.set(executionId, execution);
      broadcast('execution:complete', { executionId });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ accepted: true, executionId }));
    });
    return;
  }

  if (req.url === '/executions' && req.method === 'GET') {
    const allExecutions = Array.from(executions.values());
    const latest = allExecutions[allExecutions.length - 1];
    
    let graph = {
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
    
    if (latest?.steps) {
      latest.steps.forEach(step => {
        const node = graph.nodes.find(n => n.id === step.name);
        if (node) node.status = step.status;
      });
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ executions: allExecutions, graph }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ 
  server,
  path: '/'
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  wsClients.add(ws);
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    wsClients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsClients.delete(ws);
  });
  
  ws.send(JSON.stringify({ event: 'connected', data: { message: 'Connected to StepsOS' } }));
});

server.listen(3333, () => {
  console.log('✅ Backend running on http://localhost:3333');
  console.log('🔌 WebSocket server ready on ws://localhost:3333');
  console.log('📊 AI Analysis endpoint: POST /ai/analyze-step');
});
