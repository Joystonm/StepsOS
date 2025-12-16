#!/usr/bin/env node

/**
 * Complete StepsOS Setup Script
 * Starts backend, verifies connections, and provides frontend instructions
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

let backendProcess = null;

function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(false)); // Port is available
    });
    server.on('error', () => resolve(true)); // Port is in use
  });
}

async function waitForBackend(maxAttempts = 30) {
  console.log('⏳ Waiting for backend to be ready...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch('http://localhost:8080/executions');
      if (response.ok) {
        console.log('✅ Backend is ready!');
        return true;
      }
    } catch (error) {
      // Still starting up
    }
    
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ Backend failed to start within 30 seconds');
  return false;
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
        return true;
      }
    } catch (error) {
      console.log('❌ Port 8080 is occupied by another service.');
      console.log('   Please stop the other service or change the port in the configuration.');
      return false;
    }
  }
  
  // Start the backend
  try {
    backendProcess = spawn('node', ['backend/src/index.js'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      cwd: process.cwd()
    });
    
    // Handle backend output
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[Backend] ${output}`);
      }
    });
    
    backendProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.error(`[Backend Error] ${output}`);
      }
    });
    
    backendProcess.on('error', (error) => {
      console.error('❌ Failed to start backend:', error.message);
      return false;
    });
    
    backendProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Backend exited with code ${code}`);
        return false;
      }
    });
    
    // Wait for backend to be ready
    const ready = await waitForBackend();
    return ready;
    
  } catch (error) {
    console.error('❌ Error starting backend:', error.message);
    return false;
  }
}

async function runConnectionTests() {
  console.log('\n🧪 Running connection tests...');
  
  try {
    // Test API
    const apiResponse = await fetch('http://localhost:8080/executions');
    const apiWorking = apiResponse.ok;
    console.log(apiWorking ? '✅ API endpoints working' : '❌ API endpoints failed');
    
    // Test WebSocket (simplified)
    const WebSocket = require('ws');
    const wsWorking = await new Promise((resolve) => {
      try {
        const ws = new WebSocket('ws://localhost:8080');
        const timeout = setTimeout(() => {
          ws.close();
          resolve(false);
        }, 3000);
        
        ws.on('open', () => {
          clearTimeout(timeout);
          ws.close();
          resolve(true);
        });
        
        ws.on('error', () => {
          clearTimeout(timeout);
          resolve(false);
        });
      } catch (error) {
        resolve(false);
      }
    });
    
    console.log(wsWorking ? '✅ WebSocket connection working' : '❌ WebSocket connection failed');
    
    return apiWorking && wsWorking;
    
  } catch (error) {
    console.error('❌ Connection tests failed:', error.message);
    return false;
  }
}

function printInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('🎉 StepsOS Backend is running successfully!');
  console.log('='.repeat(60));
  console.log('');
  console.log('📊 Backend Services:');
  console.log('   • API Server: http://localhost:8080');
  console.log('   • WebSocket: ws://localhost:8080');
  console.log('');
  console.log('🌐 Available Endpoints:');
  console.log('   • GET  /executions - List all executions');
  console.log('   • POST /execute    - Start new execution');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('   1. Open a new terminal');
  console.log('   2. Navigate to the frontend directory: cd frontend');
  console.log('   3. Start the frontend: npm run dev');
  console.log('   4. Open http://localhost:5173 in your browser');
  console.log('');
  console.log('🧪 Test the connection:');
  console.log('   • Run: node test-connection.js');
  console.log('');
  console.log('⚠️  Keep this terminal open to keep the backend running.');
  console.log('   Press Ctrl+C to stop the backend.');
  console.log('');
}

function setupGracefulShutdown() {
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down StepsOS Backend...');
    
    if (backendProcess) {
      backendProcess.kill('SIGTERM');
      
      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          console.log('⚠️  Force killing backend process...');
          backendProcess.kill('SIGKILL');
        }
      }, 5000);
    }
    
    console.log('✅ Backend stopped.');
    process.exit(0);
  });
}

async function main() {
  console.log('🔧 StepsOS Complete Setup');
  console.log('='.repeat(30));
  console.log('');
  
  // Setup graceful shutdown
  setupGracefulShutdown();
  
  // Start backend
  const backendStarted = await startBackend();
  if (!backendStarted) {
    console.log('❌ Failed to start backend. Please check the error messages above.');
    process.exit(1);
  }
  
  // Run connection tests
  const testsPass = await runConnectionTests();
  if (!testsPass) {
    console.log('⚠️  Some connection tests failed, but backend is running.');
    console.log('   You can still try to start the frontend.');
  }
  
  // Print instructions
  printInstructions();
  
  // Keep the process running
  console.log('🔄 Backend is running... (Press Ctrl+C to stop)');
}

main().catch((error) => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});
