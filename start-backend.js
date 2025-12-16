#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(false)); // Port is available
    });
    server.on('error', () => resolve(true)); // Port is in use
  });
}

async function startBackend() {
  console.log('🚀 Starting StepsOS Backend...');
  
  // Check if port 8080 is already in use
  const portInUse = await checkPort(8080);
  if (portInUse) {
    console.log('⚠️  Port 8080 is already in use. Checking if it\'s our backend...');
    
    try {
      const response = await fetch('http://localhost:8080/executions');
      if (response.ok) {
        console.log('✅ Backend is already running on port 8080');
        return;
      }
    } catch (error) {
      console.log('❌ Port 8080 is occupied by another service. Please stop it first.');
      process.exit(1);
    }
  }
  
  // Start the backend
  const backend = spawn('node', ['backend/src/index.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  backend.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
  });
  
  backend.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Backend exited with code ${code}`);
      process.exit(1);
    }
  });
  
  // Wait for backend to be ready
  console.log('⏳ Waiting for backend to be ready...');
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch('http://localhost:8080/executions');
      if (response.ok) {
        console.log('✅ Backend is ready on http://localhost:8080');
        console.log('📊 Dashboard: http://localhost:5173');
        console.log('🔌 WebSocket: ws://localhost:8080');
        return;
      }
    } catch (error) {
      // Still starting up
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
    process.stdout.write('.');
  }
  
  console.log('\n❌ Backend failed to start within 30 seconds');
  process.exit(1);
}

startBackend().catch(console.error);
