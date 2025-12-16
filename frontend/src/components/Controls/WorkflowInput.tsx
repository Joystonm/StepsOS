import React, { useState } from 'react';
import { api } from '../../services/api';

interface WorkflowInputProps {
  onExecutionStart: (executionId: string) => void;
}

export default function WorkflowInput({ onExecutionStart }: WorkflowInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [detectedMode, setDetectedMode] = useState<string>('');

  const detectInputMode = (input: string) => {
    try {
      const parsed = JSON.parse(input);
      
      if (parsed.workflowId && parsed.executionId && parsed.input) {
        return 'Workflow';
      }
      if (parsed.executionId && parsed.replay) {
        return 'Replay';
      }
      if (parsed.type || parsed.requestId || parsed.payload || parsed.user) {
        return 'API Step';
      }
      return 'Unknown';
    } catch {
      return 'Invalid JSON';
    }
  };

  const executeWorkflow = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Input cannot be empty');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const rawInput = JSON.parse(trimmed);
      const response = await api.post('/execute', rawInput);
      
      console.log('Execute response:', response);
      
      if (response.success) {
        onExecutionStart(response.data.executionId);
        setSuccess(response.data.message || `Execution started: ${response.data.executionId}`);
        setError('');
      } else {
        setError(response.error || 'Execution failed');
        setSuccess('');
      }
    } catch (error: any) {
      console.error('Execution error:', error);
      if (error instanceof SyntaxError) {
        setError('Invalid JSON format');
      } else if (error.guidance) {
        // Handle structured error response
        setError(`${error.error}\n\n${error.guidance}:\n${error.formats?.map((f: any) => `• ${f.name}`).join('\n') || ''}`);
      } else {
        setError('Failed to execute workflow');
      }
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  // Update detected mode when input changes
  React.useEffect(() => {
    const mode = detectInputMode(inputValue);
    setDetectedMode(mode);
  }, [inputValue]);

  return (
    <div className="workflow-input">
      <div className="input-header">
        <h3>Input</h3>
        <span className={`input-mode ${detectedMode.toLowerCase().replace(' ', '-')}`}>
          {detectedMode}
        </span>
      </div>
      
      <textarea
        className="workflow-input-textarea"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        rows={12}
        placeholder="Enter JSON input..."
      />
      
      {error && (
        <div className="input-error">{error}</div>
      )}
      
      {success && (
        <div className="input-success">{success}</div>
      )}
      
      <button 
        onClick={executeWorkflow} 
        disabled={loading || detectedMode === 'Invalid JSON'}
        className="execute-button"
      >
        {loading ? 'Executing...' : 'Execute'}
      </button>
    </div>
  );
}
