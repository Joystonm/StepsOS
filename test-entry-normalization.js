#!/usr/bin/env node

/**
 * Test entry step normalization fix
 */

async function testEntryNormalization() {
  console.log('🧪 Testing Entry Step Normalization...');
  
  const testInput = {
    executionId: 'test_norm_001',
    workflowId: 'file_upload_flow',
    input: {
      fileId: 'test_file_123',
      fileName: 'test-image.png',
      fileSizeMB: 3.5,
      fileType: 'image/png',
      uploadedBy: 'test_user_456',
      checksum: 'sha256_test_hash'
    }
  };
  
  try {
    console.log('📤 Sending test input:', JSON.stringify(testInput, null, 2));
    
    const response = await fetch('http://localhost:8080/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInput)
    });
    
    const result = await response.json();
    console.log('✅ Execute response:', result);
    
    // Wait for execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check results
    const execResponse = await fetch('http://localhost:8080/executions');
    const execData = await execResponse.json();
    
    const latestExecution = execData.executions?.[execData.executions.length - 1];
    if (latestExecution?.steps) {
      console.log('\n📊 Step Results:');
      
      const entryStep = latestExecution.steps.find(s => s.name === 'entry');
      if (entryStep) {
        console.log('🔹 Entry Step:');
        console.log('  Status:', entryStep.status);
        console.log('  Output:', JSON.stringify(entryStep.output, null, 2));
        
        // Check if entry step normalized correctly
        if (entryStep.output?.fileId === 'test_file_123' && 
            entryStep.output?.fileSizeMB === 3.5) {
          console.log('✅ Entry step normalization WORKING!');
        } else {
          console.log('❌ Entry step normalization FAILED!');
        }
      }
      
      const validateStep = latestExecution.steps.find(s => s.name === 'validate');
      if (validateStep) {
        console.log('🔹 Validate Step:');
        console.log('  Status:', validateStep.status);
        if (validateStep.status === 'completed') {
          console.log('✅ Validation PASSED!');
        } else {
          console.log('❌ Validation FAILED:', validateStep.error);
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
    testEntryNormalization();
  })
  .catch(() => {
    console.log('❌ Server not running. Please start: npm run dev');
    process.exit(1);
  });
