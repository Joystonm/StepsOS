#!/usr/bin/env node

/**
 * Test with exact input format provided by user
 */

async function testExactInput() {
  console.log('🧪 Testing Exact Input Format...');
  
  const testInput = {
    "executionId": "exec_test_007",
    "workflowId": "file_upload_flow",
    "input": {
      "fileId": "file_789",
      "fileName": "architecture.exe",
      "fileSizeMB": 12.4,
      "fileType": "application/x-msdownload",
      "uploadedBy": "user_42",
      "checksum": "abc123xyz"
    }
  };
  
  try {
    console.log('📤 Sending:', JSON.stringify(testInput, null, 2));
    
    const response = await fetch('http://localhost:8080/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInput)
    });
    
    const result = await response.json();
    console.log('✅ Response:', result);
    
    // Wait for execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check results
    const execResponse = await fetch('http://localhost:8080/executions');
    const execData = await execResponse.json();
    
    const latestExecution = execData.executions?.[execData.executions.length - 1];
    if (latestExecution?.steps) {
      console.log('\n📊 Step Results:');
      
      latestExecution.steps.forEach(step => {
        console.log(`🔹 ${step.name}: ${step.status}`);
        if (step.output) {
          console.log(`   Output: ${JSON.stringify(step.output)}`);
        }
        if (step.error) {
          console.log(`   Error: ${step.error}`);
        }
      });
      
      const entryStep = latestExecution.steps.find(s => s.name === 'entry');
      if (entryStep?.output?.fileId === 'file_789') {
        console.log('\n✅ ENTRY STEP FIXED! Correct fileId extracted.');
      } else {
        console.log('\n❌ Entry step still broken.');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if server is running
fetch('http://localhost:8080/executions')
  .then(() => {
    console.log('✅ Server detected, running test...');
    testExactInput();
  })
  .catch(() => {
    console.log('❌ Server not running. Please start: npm run dev');
    process.exit(1);
  });
