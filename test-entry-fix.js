#!/usr/bin/env node

/**
 * Quick test to verify the entry step fix
 */

async function testEntryStepFix() {
  console.log('🧪 Testing Entry Step Fix...');
  
  const testInput = {
    executionId: 'exec_valid_001',
    workflowId: 'file_upload_flow',
    input: {
      fileId: 'file_001',
      fileName: 'diagram.png',
      fileSizeMB: 5.2,
      fileType: 'image/png',
      uploadedBy: 'user_42',
      checksum: 'abc123xyz'
    }
  };
  
  try {
    const response = await fetch('http://localhost:8080/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInput)
    });
    
    const result = await response.json();
    console.log('✅ Response:', result);
    
    // Wait for execution to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check execution status
    const statusResponse = await fetch('http://localhost:8080/executions');
    const statusData = await statusResponse.json();
    
    const latestExecution = statusData.executions?.[statusData.executions.length - 1];
    if (latestExecution) {
      console.log('📊 Latest execution:', latestExecution.id, latestExecution.status);
      
      const validateStep = latestExecution.steps?.find(s => s.name === 'validate');
      if (validateStep) {
        console.log('🔍 Validate step:', validateStep.status);
        if (validateStep.status === 'completed') {
          console.log('✅ Entry step normalization is working correctly!');
        } else {
          console.log('❌ Validate step failed:', validateStep.error);
        }
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
    testEntryStepFix();
  })
  .catch(() => {
    console.log('❌ Server not running. Please start: npm run dev');
    process.exit(1);
  });
