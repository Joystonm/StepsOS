#!/usr/bin/env node

/**
 * StepsOS Strict Validation Test Suite
 * Tests all edge cases and requirements for the validation fix
 */

const testCases = [
  {
    name: "✅ Valid Input - Should Pass All Steps",
    input: {
      payload: {
        fileName: "test.png",
        fileSizeMB: 2.5,
        fileType: "image/png",
        checksum: "abc123def456"
      },
      user: {
        id: "user123"
      }
    },
    expectedResult: "All steps should complete successfully"
  },
  
  {
    name: "❌ Missing fileId - Should Fail Validate",
    input: {
      payload: {
        fileName: "",  // Empty fileName will result in empty fileId
        fileSizeMB: 2.5,
        fileType: "image/png",
        checksum: "abc123def456"
      },
      user: {
        id: "user123"
      }
    },
    expectedResult: "validate step should fail with 'fileId is required'"
  },
  
  {
    name: "❌ Empty fileId - Should Fail Validate",
    input: {
      payload: {
        fileName: "   ",  // Whitespace-only fileName
        fileSizeMB: 2.5,
        fileType: "image/png",
        checksum: "abc123def456"
      },
      user: {
        id: "user123"
      }
    },
    expectedResult: "validate step should fail with 'fileId must be non-empty string'"
  },
  
  {
    name: "❌ Missing fileName - Should Fail Validate",
    input: {
      payload: {
        // fileName missing
        fileSizeMB: 2.5,
        fileType: "image/png",
        checksum: "abc123def456"
      },
      user: {
        id: "user123"
      }
    },
    expectedResult: "validate step should fail with 'fileName is required'"
  },
  
  {
    name: "❌ fileSizeMB = 0 - Should Fail Validate",
    input: {
      payload: {
        fileName: "test.png",
        fileSizeMB: 0,
        fileType: "image/png",
        checksum: "abc123def456"
      },
      user: {
        id: "user123"
      }
    },
    expectedResult: "validate step should fail with 'fileSizeMB must be > 0'"
  },
  
  {
    name: "❌ fileSizeMB wrong type - Should Fail Validate",
    input: {
      payload: {
        fileName: "test.png",
        fileSizeMB: "2.5",  // String instead of number
        fileType: "image/png",
        checksum: "abc123def456"
      },
      user: {
        id: "user123"
      }
    },
    expectedResult: "validate step should fail with 'fileSizeMB must be a number'"
  },
  
  {
    name: "❌ Unsupported fileType - Should Fail Validate",
    input: {
      payload: {
        fileName: "test.pdf",
        fileSizeMB: 2.5,
        fileType: "application/pdf",
        checksum: "abc123def456"
      },
      user: {
        id: "user123"
      }
    },
    expectedResult: "validate step should fail with 'Unsupported fileType'"
  },
  
  {
    name: "❌ Missing uploadedBy - Should Fail Validate",
    input: {
      payload: {
        fileName: "test.png",
        fileSizeMB: 2.5,
        fileType: "image/png",
        checksum: "abc123def456"
      },
      user: {
        // id missing
      }
    },
    expectedResult: "validate step should fail with 'uploadedBy is required'"
  },
  
  {
    name: "❌ checksum wrong type - Should Fail Validate",
    input: {
      payload: {
        fileName: "test.png",
        fileSizeMB: 2.5,
        fileType: "image/png",
        checksum: 123456  // Number instead of string
      },
      user: {
        id: "user123"
      }
    },
    expectedResult: "validate step should fail with 'checksum must be a string'"
  },
  
  {
    name: "❌ Missing input object - Should Reject Execution",
    input: null,
    expectedResult: "Execution should be rejected before any step runs"
  },
  
  {
    name: "❌ Multiple validation errors - Should Report All",
    input: {
      payload: {
        // fileName missing
        fileSizeMB: 0,  // Invalid size
        fileType: "application/pdf",  // Unsupported type
        checksum: 123  // Wrong type
      },
      user: {
        // id missing
      }
    },
    expectedResult: "validate step should fail with multiple errors listed"
  }
];

async function runTest(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📝 Expected: ${testCase.expectedResult}`);
  
  try {
    const response = await fetch('http://localhost:3001/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCase.input)
    });
    
    const result = await response.json();
    console.log(`📊 Response:`, result);
    
    if (!result.accepted) {
      console.log(`❌ Execution rejected: ${result.error}`);
      return;
    }
    
    // Wait for execution to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check execution results
    const execResponse = await fetch('http://localhost:3001/executions');
    const execData = await execResponse.json();
    
    console.log(`📈 Final Status:`, execData.executions?.[execData.executions.length - 1]);
    
  } catch (error) {
    console.log(`💥 Test Error:`, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting StepsOS Strict Validation Test Suite');
  console.log('=' .repeat(60));
  
  for (const testCase of testCases) {
    await runTest(testCase);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between tests
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test Suite Complete');
  console.log('\n📋 Validation Requirements Checklist:');
  console.log('□ Pre-execution contract check (executionId, workflowId, input)');
  console.log('□ Strict field validation (fileId, fileName, fileSizeMB, fileType, uploadedBy, checksum)');
  console.log('□ Validation step fails immediately on invalid input');
  console.log('□ Process step skipped when validate fails');
  console.log('□ Proper logging with structured JSON format');
  console.log('□ Multiple validation errors reported together');
  console.log('□ Deterministic step execution behavior');
}

// Check if server is running
fetch('http://localhost:3001/executions')
  .then(() => {
    console.log('✅ Server detected, starting tests...');
    runAllTests();
  })
  .catch(() => {
    console.log('❌ Server not running. Please start the backend server first:');
    console.log('   cd backend && npm start');
    process.exit(1);
  });
