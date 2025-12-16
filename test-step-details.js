#!/usr/bin/env node

/**
 * Test to verify step details data structure
 */

async function testStepDetails() {
  console.log('🧪 Testing Step Details Data...');
  
  try {
    // 1. Start an execution
    console.log('1. Starting execution...');
    const executeResponse = await fetch('http://localhost:8080/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executionId: 'test_exec_001',
        workflowId: 'file_upload_flow',
        input: {
          fileId: 'test_file',
          fileName: 'test.png',
          fileSizeMB: 2.5,
          fileType: 'image/png',
          uploadedBy: 'test_user',
          checksum: 'test123'
        }
      })
    });
    
    const executeResult = await executeResponse.json();
    console.log('Execute result:', executeResult);
    
    // 2. Wait for execution to complete
    console.log('2. Waiting for execution...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. Check executions endpoint
    console.log('3. Checking executions data...');
    const execResponse = await fetch('http://localhost:8080/executions');
    const execData = await execResponse.json();
    
    console.log('Executions response:', JSON.stringify(execData, null, 2));
    
    if (execData.executions && execData.executions.length > 0) {
      const latestExecution = execData.executions[execData.executions.length - 1];
      console.log('\n📊 Latest execution:', latestExecution.id);
      console.log('Status:', latestExecution.status);
      
      if (latestExecution.steps) {
        console.log('Steps found:', latestExecution.steps.length);
        latestExecution.steps.forEach(step => {
          console.log(`  - ${step.name}: ${step.status}`);
          if (step.input) console.log(`    Input: ${JSON.stringify(step.input).substring(0, 100)}...`);
          if (step.output) console.log(`    Output: ${JSON.stringify(step.output).substring(0, 100)}...`);
          if (step.logs) console.log(`    Logs: ${step.logs.length} entries`);
        });
      } else {
        console.log('❌ No steps data found');
      }
    } else {
      console.log('❌ No executions found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if server is running
fetch('http://localhost:8080/executions')
  .then(() => {
    console.log('✅ Server detected, running test...');
    testStepDetails();
  })
  .catch(() => {
    console.log('❌ Server not running. Please start: npm run dev');
    process.exit(1);
  });
