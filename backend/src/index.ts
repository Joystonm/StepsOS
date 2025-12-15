import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { logger } from './utils/logger.js';
import { eventsStream } from './streaming/events.stream.js';

// Simple HTTP server for API endpoints
const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/executions' && req.method === 'GET') {
    // Mock execution data
    const mockGraph = {
      nodes: [
        { id: 'start', type: 'entry', status: 'completed', x: 400, y: 100 },
        { id: 'validate', type: 'workflow', status: 'running', x: 400, y: 220 },
        { id: 'process', type: 'workflow', status: 'pending', x: 400, y: 340 }
      ],
      edges: [
        { from: 'start', to: 'validate' },
        { from: 'validate', to: 'process' }
      ]
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      executions: [],
      graph: mockGraph
    }));
    return;
  }

  if (req.url?.startsWith('/steps/') && req.method === 'GET') {
    const stepId = req.url.split('/')[2];
    const mockStep = {
      id: stepId,
      name: stepId,
      status: 'running',
      input: { data: 'sample input' },
      output: { result: 'sample output' },
      logs: ['Step started', 'Processing data', 'Step in progress']
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockStep));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  logger.info('Client connected to WebSocket');
  eventsStream.addClient(ws);

  ws.on('close', () => {
    logger.info('Client disconnected from WebSocket');
    eventsStream.removeClient(ws);
  });

  // Send initial connection message
  ws.send(JSON.stringify({
    event: 'connected',
    data: { message: 'Connected to StepsOS' },
    timestamp: new Date().toISOString()
  }));
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  logger.info(`StepsOS running on port ${port}`);
  
  // Simulate some step execution events
  setTimeout(() => {
    eventsStream.emit('step:start', { stepId: 'validate', timestamp: new Date().toISOString() });
  }, 2000);
  
  setTimeout(() => {
    eventsStream.emit('step:complete', { stepId: 'validate', timestamp: new Date().toISOString() });
    eventsStream.emit('step:start', { stepId: 'process', timestamp: new Date().toISOString() });
  }, 5000);
});
