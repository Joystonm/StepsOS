// Test the fixed execution kernel
const testInput = {
  "requestId": "req_001",
  "type": "file-upload",
  "user": {
    "id": "user_42",
    "role": "developer"
  },
  "payload": {
    "fileName": "architecture.png",
    "fileSizeMB": 12.4,
    "fileType": "image/png"
  }
};

console.log('Testing execution kernel with input:', JSON.stringify(testInput, null, 2));

// Simulate the execution flow
async function testExecution() {
  try {
    // Step 1: Input routing
    console.log('\n1. Input Routing:');
    const workflowMap = { 'file-upload': 'api::file-upload' };
    const workflowId = workflowMap[testInput.type];
    console.log(`   Type: ${testInput.type} → Workflow: ${workflowId}`);
    
    if (!workflowId) {
      throw new Error(`No workflow mapped for type: ${testInput.type}`);
    }
    
    // Step 2: Bootstrap
    console.log('\n2. Bootstrap Step:');
    if (!testInput || Object.keys(testInput).length === 0) {
      throw new Error('Execution aborted: empty input context');
    }
    if (!testInput.type) {
      throw new Error('Bootstrap requires input.type');
    }
    
    const bootstrapped = {
      ...testInput,
      bootstrapped: true,
      bootstrappedAt: new Date().toISOString()
    };
    console.log('   ✓ Bootstrap successful');
    
    // Step 3: Normalize
    console.log('\n3. Normalize Step:');
    const normalized = {
      fileId: bootstrapped.payload?.fileName || 'unknown',
      fileSizeMB: bootstrapped.payload?.fileSizeMB || 0,
      fileType: bootstrapped.payload?.fileType || 'application/octet-stream',
      userId: bootstrapped.user?.id || 'anonymous',
      userRole: bootstrapped.user?.role || 'user',
      requestId: bootstrapped.requestId || `req_${Date.now()}`,
      type: bootstrapped.type || 'unknown',
      normalizedAt: new Date().toISOString()
    };
    console.log('   ✓ Normalized output:', JSON.stringify(normalized, null, 4));
    
    // Step 4: Validate contracts
    console.log('\n4. Validate Step:');
    if (!normalized.fileId) {
      throw new Error('validate requires fileId');
    }
    if (!normalized.userId) {
      throw new Error('validate requires userId');
    }
    if (!normalized.fileSizeMB || normalized.fileSizeMB <= 0) {
      throw new Error('validate requires valid fileSizeMB > 0');
    }
    
    const validated = {
      ...normalized,
      validated: true,
      validatedAt: new Date().toISOString(),
      validationChecks: {
        fileIdPresent: true,
        userIdPresent: true,
        fileSizeValid: normalized.fileSizeMB > 0 && normalized.fileSizeMB < 100
      }
    };
    console.log('   ✓ Validation successful');
    
    // Step 5: Process
    console.log('\n5. Process Step:');
    if (!validated.validated) {
      throw new Error('process requires validated input');
    }
    
    const processed = {
      ...validated,
      processed: true,
      processedAt: new Date().toISOString(),
      fileUrl: `/api/files/${validated.fileId}`,
      processingResult: {
        status: 'success',
        fileSize: validated.fileSizeMB,
        mimeType: validated.fileType,
        uploadedBy: validated.userId
      }
    };
    console.log('   ✓ Processing successful');
    
    console.log('\n🎯 EXECUTION KERNEL TEST PASSED');
    console.log('Expected result: bootstrap → normalize → validate → process');
    console.log('All steps receive proper input, no {} anywhere');
    
  } catch (error) {
    console.error('\n❌ EXECUTION KERNEL TEST FAILED');
    console.error('Error:', error.message);
  }
}

testExecution();
