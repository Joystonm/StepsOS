#!/usr/bin/env node

/**
 * Quick test to verify the validation fix
 */

async function testValidation() {
  console.log('🧪 Testing StepsOS Validation Fix');
  console.log('=' .repeat(50));
  
  // Test 1: Valid input - should pass
  console.log('\n✅ Test 1: Valid Input');
  try {
    const response = await fetch('http://localhost:3001/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          fileName: "test.png",
          fileSizeMB: 2.5,
          fileType: "image/png",
          checksum: "abc123def456"
        },
        user: { id: "user123" }
      })
    });
    
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Invalid input - should fail validation
  console.log('\n❌ Test 2: Invalid Input (missing fileId)');
  try {
    const response = await fetch('http://localhost:3001/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          fileName: "",  // Empty fileName results in empty fileId
          fileSizeMB: 2.5,
          fileType: "image/png",
          checksum: "abc123def456"
        },
        user: { id: "user123" }
      })
    });
    
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Multiple validation errors
  console.log('\n❌ Test 3: Multiple Validation Errors');
  try {
    const response = await fetch('http://localhost:3001/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          // fileName missing
          fileSizeMB: 0,  // Invalid size
          fileType: "application/pdf",  // Unsupported type
          checksum: 123  // Wrong type
        },
        user: {
          // id missing
        }
      })
    });
    
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Check final execution status
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n📊 Final Execution Status:');
  try {
    const execResponse = await fetch('http://localhost:3001/executions');
    const execData = await execResponse.json();
    console.log(JSON.stringify(execData, null, 2));
  } catch (error) {
    console.log('Error fetching executions:', error.message);
  }
}

// Check if server is running
fetch('http://localhost:3001/executions')
  .then(() => {
    console.log('✅ Server detected, running tests...');
    testValidation();
  })
  .catch(() => {
    console.log('❌ Server not running. Please start the backend server first:');
    console.log('   cd backend && npm start');
    process.exit(1);
  });
