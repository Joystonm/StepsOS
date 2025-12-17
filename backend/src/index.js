import 'dotenv/config';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

async function analyzeWithGroq(stepData) {
  return `Analysis for ${stepData.stepName || 'unknown step'}:

Status: ${stepData.status || 'unknown'}
Error: ${stepData.error || 'None'}

Summary: The step "${stepData.stepName}" failed with error "${stepData.error}". This indicates a validation issue.

Suggestions:
- Check input data format
- Verify required fields are present
- Review validation rules`;
}

const executions = new Map();
const wsClients = new Set();

function broadcast(event, data) {
  const message = JSON.stringify({ event, data });
  wsClients.forEach(ws => {
    if (ws.readyState === 1) ws.send(message);
  });
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
        
        const execution = {
          id: executionId,
          status: 'failed',
          steps: [
            {
              name: 'entry',
              status: 'completed',
              input: input,
              output: {
                fileId: 'test-file-123',
                fileName: 'test.pdf',
                fileSizeMB: 2.5,
                fileType: 'application/pdf',
                uploadedBy: 'user',
                checksum: 'abc123'
              },
              logs: ['Step entry completed successfully at ' + new Date().toISOString()]
            },
            {
              name: 'validate',
              status: 'failed',
              input: {
                fileId: 'test-file-123',
                fileName: 'test.pdf',
                fileSizeMB: 2.5,
                fileType: 'application/pdf',
                uploadedBy: 'user',
                checksum: 'abc123'
              },
              output: null,
              error: 'Unsupported fileType',
              logs: [
                'Step validate failed at ' + new Date().toISOString(),
                'Reason: Unsupported fileType'
              ]
            }
          ]
        };
        
        executions.set(executionId, execution);
        broadcast('execution:failed', { executionId, error: 'Unsupported fileType' });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accepted: true, executionId }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accepted: false, error: error.message }));
      }
    });
    return;
  }

  if (req.url === '/ai-analysis' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const stepData = JSON.parse(body);
        const analysis = await analyzeWithGroq(stepData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ analysis }));
      } catch (error) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ analysis: `Error: ${error.message}` }));
      }
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
      const stepStates = {};
      latest.steps.forEach(step => {
        stepStates[step.name] = step.status;
      });
      
      graph.nodes.forEach(node => {
        if (stepStates[node.id]) {
          node.status = stepStates[node.id];
        }
      });
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      executions: allExecutions,
      graph
    }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
  wsClients.add(ws);
  ws.on('close', () => wsClients.delete(ws));
  ws.send(JSON.stringify({ event: 'connected', data: { message: 'Connected' } }));
});

server.listen(4000, () => {
  console.log('✅ Backend running on http://localhost:4000');
  console.log('📊 Available endpoints:');
  console.log('   POST /execute - Start execution');
  console.log('   POST /ai-analysis - AI analysis');
  console.log('   GET  /executions - List executions');
});
