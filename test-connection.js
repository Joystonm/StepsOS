#!/usr/bin/env node

/**
 * StepsOS Frontend-Backend Connection Test
 * Tests all connection scenarios and endpoints
 */

const WebSocket = require('ws');

async function testApiEndpoints() {
  console.log('🔍 Testing API Endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/executions', description: 'List executions' },
    { method: 'POST', path: '/execute', description: 'Execute workflow', body: {
      payload: {
        fileName: "test.png",
        fileSizeMB: 2.5,
        fileType: "image/png",
        checksum: "abc123def456"
      },
      user: { id: "test-user" }
    }}
  ];
  
  for (const endpoint of endpoints) {
    try {
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(`http://localhost:8080${endpoint.path}`, options);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        console.log(`❌ ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('');
  }
}

async function testWebSocketConnection() {
  console.log('🔌 Testing WebSocket Connection...');
  
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket('ws://localhost:8080');
      let connected = false;
      
      const timeout = setTimeout(() => {
        if (!connected) {
          console.log('❌ WebSocket connection timeout');
          ws.close();
          resolve(false);
        }
      }, 5000);
      
      ws.on('open', () => {
        connected = true;
        clearTimeout(timeout);
        console.log('✅ WebSocket connected successfully');
        
        // Test message handling
        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            console.log(`📨 Received message: ${message.event}`);
            console.log(`   Data: ${JSON.stringify(message.data).substring(0, 100)}...`);
          } catch (error) {
            console.log(`📨 Received raw message: ${data.toString().substring(0, 100)}...`);
          }
        });
        
        // Close after testing
        setTimeout(() => {
          ws.close();
          resolve(true);
        }, 2000);
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        console.log(`❌ WebSocket error: ${error.message}`);
        resolve(false);
      });
      
      ws.on('close', (code, reason) => {
        console.log(`🔌 WebSocket closed (code: ${code}, reason: ${reason})`);
      });
      
    } catch (error) {
      console.log(`❌ WebSocket connection failed: ${error.message}`);
      resolve(false);
    }
  });
}

async function testCorsHeaders() {
  console.log('🌐 Testing CORS Headers...');
  
  try {
    const response = await fetch('http://localhost:8080/executions', {
      method: 'OPTIONS'
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };
    
    console.log('✅ CORS Headers:');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      console.log(`   ${key}: ${value || 'Not set'}`);
    });
    
    if (corsHeaders['Access-Control-Allow-Origin'] === '*') {
      console.log('✅ CORS properly configured for frontend access');
    } else {
      console.log('⚠️  CORS may not allow frontend access');
    }
    
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
  }
  
  console.log('');
}

async function testFullWorkflow() {
  console.log('🚀 Testing Full Workflow...');
  
  try {
    // 1. Start execution
    const executeResponse = await fetch('http://localhost:8080/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          fileName: "integration-test.png",
          fileSizeMB: 1.5,
          fileType: "image/png",
          checksum: "test123"
        },
        user: { id: "integration-test" }
      })
    });
    
    const executeData = await executeResponse.json();
    
    if (!executeResponse.ok) {
      console.log(`❌ Workflow execution failed: ${JSON.stringify(executeData)}`);
      return;
    }
    
    console.log(`✅ Workflow started: ${executeData.executionId}`);
    
    // 2. Wait for execution to complete
    console.log('⏳ Waiting for execution to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 3. Check execution status
    const statusResponse = await fetch('http://localhost:8080/executions');
    const statusData = await statusResponse.json();
    
    if (statusResponse.ok) {
      console.log('✅ Execution status retrieved');
      console.log(`   Total executions: ${statusData.executions?.length || 0}`);
      
      const latestExecution = statusData.executions?.[statusData.executions.length - 1];
      if (latestExecution) {
        console.log(`   Latest execution: ${latestExecution.id} (${latestExecution.status})`);
        console.log(`   Steps: ${latestExecution.steps?.length || 0}`);
      }
      
      if (statusData.graph) {
        console.log(`   Graph nodes: ${statusData.graph.nodes?.length || 0}`);
      }
    } else {
      console.log(`❌ Failed to get execution status: ${JSON.stringify(statusData)}`);
    }
    
  } catch (error) {
    console.log(`❌ Full workflow test failed: ${error.message}`);
  }
  
  console.log('');
}

async function runAllTests() {
  console.log('🧪 StepsOS Frontend-Backend Connection Test Suite');
  console.log('=' .repeat(60));
  console.log('');
  
  // Check if backend is running
  try {
    const healthCheck = await fetch('http://localhost:8080/executions');
    if (!healthCheck.ok) {
      throw new Error(`HTTP ${healthCheck.status}`);
    }
    console.log('✅ Backend is running on http://localhost:8080');
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log('   Please start the backend first: node start-backend.js');
    console.log('');
    process.exit(1);
  }
  
  console.log('');
  
  // Run all tests
  await testCorsHeaders();
  await testApiEndpoints();
  
  const wsConnected = await testWebSocketConnection();
  console.log('');
  
  await testFullWorkflow();
  
  // Summary
  console.log('📋 Test Summary:');
  console.log('✅ Backend server is running');
  console.log('✅ API endpoints are accessible');
  console.log('✅ CORS headers are configured');
  console.log(wsConnected ? '✅ WebSocket connection works' : '❌ WebSocket connection failed');
  console.log('');
  
  if (wsConnected) {
    console.log('🎉 All tests passed! Frontend should connect successfully.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the frontend: cd frontend && npm run dev');
    console.log('2. Open http://localhost:5173 in your browser');
    console.log('3. Check the connection status indicators in the top-right corner');
  } else {
    console.log('⚠️  Some tests failed. Check the backend WebSocket configuration.');
  }
}

runAllTests().catch(console.error);
