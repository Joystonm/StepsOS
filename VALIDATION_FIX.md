# StepsOS Validation Fix Implementation

## Overview

This fix addresses the critical bug where invalid inputs were passing validation and allowing downstream steps to run. The implementation ensures strict validation, proper logging, and deterministic step execution.

## Key Changes

### 1️⃣ Pre-Execution Contract Check

**Before any Step runs**, the system validates the top-level execution object:

```javascript
function validateExecutionContract(executionId, workflowId, input) {
  if (!executionId || typeof executionId !== 'string' || executionId.trim() === '') {
    throw new Error('executionId is required and must be a non-empty string');
  }
  
  if (!workflowId || typeof workflowId !== 'string' || workflowId.trim() === '') {
    throw new Error('Missing workflowId or input object');
  }
  
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Missing workflowId or input object');
  }
  
  return true;
}
```

**Rejection Behavior:**
- If validation fails → execution is rejected immediately
- Logs: `{"event": "execution.rejected", "status": "failed", "reason": "Missing workflowId or input object", "timestamp": "<ISO>"}`
- No validate/process steps run

### 2️⃣ Validate Step: Strict Field Checks

The validate step now performs comprehensive field-level validation:

| Field | Type | Rule | Error Message |
|-------|------|------|---------------|
| fileId | string | Required, non-empty | "fileId is required" / "fileId must be non-empty string" |
| fileName | string | Required, non-empty | "fileName is required" / "fileName must be non-empty string" |
| fileSizeMB | number | Required, > 0 | "fileSizeMB is required" / "fileSizeMB must be a number" / "fileSizeMB must be > 0" |
| fileType | string | Must be one of ["image/png","image/jpeg","image/gif"] | "fileType is required" / "Unsupported fileType" |
| uploadedBy | string | Required, non-empty | "uploadedBy is required" / "uploadedBy must be non-empty string" |
| checksum | string | Required, must be string | "checksum is required" / "checksum must be a string" |

**Multiple Errors:**
When multiple fields fail validation, all errors are reported together:
```javascript
const errors = [];
// ... collect all validation errors
if (errors.length > 0) {
  throw new Error(errors.join(', '));
}
```

### 3️⃣ Prevent Downstream Execution

The process step now checks validate status before execution:

```javascript
execute: (input) => {
  // Contract enforcement - check if validate step passed
  if (!input?.validation || input.validation.status !== 'passed') {
    throw new Error("validate Step failed");
  }
  // ... processing logic
}
```

**Skipping Behavior:**
- If validate failed → process step is skipped
- Log: `{"event": "step.skipped", "step": "process", "status": "skipped", "reason": "validate Step failed", "timestamp": "<ISO>"}`

### 4️⃣ Logging Standards

All step events follow structured JSON logging:

**Step Started:**
```json
{"event": "step.started", "step": "validate", "timestamp": "<ISO>"}
```

**Step Success:**
```json
{"event": "step.completed", "step": "validate", "status": "success", "timestamp": "<ISO>"}
```

**Step Failed:**
```json
{"event": "step.failed", "step": "validate", "status": "failed", "reason": "fileId is required", "timestamp": "<ISO>"}
```

**Step Skipped:**
```json
{"event": "step.skipped", "step": "process", "status": "skipped", "reason": "validate Step failed", "timestamp": "<ISO>"}
```

### 5️⃣ Edge Cases Covered

| Case | Behavior | Error Message |
|------|----------|---------------|
| Missing fileId | Validate fails | "fileId is required" |
| Empty fileId | Validate fails | "fileId must be non-empty string" |
| fileSizeMB = 0 | Validate fails | "fileSizeMB must be > 0" |
| fileSizeMB wrong type | Validate fails | "fileSizeMB must be a number" |
| Missing fileName | Validate fails | "fileName is required" |
| Unsupported fileType | Validate fails | "Unsupported fileType" |
| Missing input | Execution rejected | "Missing workflowId or input object" |
| Missing workflowId | Execution rejected | "Missing workflowId or input object" |
| checksum wrong type | Validate fails | "checksum must be a string" |

### 6️⃣ Frontend / Graph Updates

- **Failed validate** → Step marked ❌ failed
- **Skipped process** → Step marked ⏹ skipped  
- **Passed validate & process** → Steps marked ✅ success
- All error messages appear in Step detail panel clearly

### 7️⃣ Deterministic Behavior

✅ **Guaranteed Behaviors:**
- Validation **must fail** for any invalid input
- Downstream steps **must not run** if validation fails
- Logs **must reflect** actual state: started, failed, skipped, completed
- Multiple validation errors are **always reported together**

## Testing

### Quick Test
```bash
node test-validation-fix.js
```

### Comprehensive Test Suite
```bash
node test-strict-validation.js
```

### Test Cases Covered

1. ✅ Valid input → All steps complete
2. ❌ Missing fileId → Validate fails, Process skipped
3. ❌ Empty fileId → Validate fails, Process skipped
4. ❌ Missing fileName → Validate fails, Process skipped
5. ❌ fileSizeMB = 0 → Validate fails, Process skipped
6. ❌ fileSizeMB wrong type → Validate fails, Process skipped
7. ❌ Unsupported fileType → Validate fails, Process skipped
8. ❌ Missing uploadedBy → Validate fails, Process skipped
9. ❌ checksum wrong type → Validate fails, Process skipped
10. ❌ Missing input → Execution rejected
11. ❌ Multiple errors → All reported together

## Files Modified

- `backend/src/index.js` - Main validation logic and step execution
- `backend/src/execution/workflow.engine.js` - Workflow engine validation
- `test-validation-fix.js` - Quick validation test
- `test-strict-validation.js` - Comprehensive test suite

## Verification Checklist

- [x] Pre-execution contract check (executionId, workflowId, input)
- [x] Strict field validation (fileId, fileName, fileSizeMB, fileType, uploadedBy, checksum)
- [x] Validation step fails immediately on invalid input
- [x] Process step skipped when validate fails
- [x] Proper logging with structured JSON format
- [x] Multiple validation errors reported together
- [x] Deterministic step execution behavior
- [x] Frontend graph updates reflect actual step states
- [x] All edge cases covered and tested

## Usage

1. Start the backend server:
   ```bash
   cd backend && npm start
   ```

2. Test with valid input:
   ```bash
   curl -X POST http://localhost:3001/execute \
     -H "Content-Type: application/json" \
     -d '{
       "payload": {
         "fileName": "test.png",
         "fileSizeMB": 2.5,
         "fileType": "image/png",
         "checksum": "abc123def456"
       },
       "user": {"id": "user123"}
     }'
   ```

3. Test with invalid input:
   ```bash
   curl -X POST http://localhost:3001/execute \
     -H "Content-Type: application/json" \
     -d '{
       "payload": {
         "fileName": "",
         "fileSizeMB": 0,
         "fileType": "application/pdf",
         "checksum": 123
       },
       "user": {}
     }'
   ```

The fix ensures that StepsOS now has **strict validation**, **proper logging**, and **deterministic step execution** that covers all basic, advanced, and edge cases as required.
