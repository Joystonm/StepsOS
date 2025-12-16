import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AIChatbot } from '../AIChatbot';

interface StepDetailsProps {
  selectedNode: string | null;
  executionId: string | null;
}

export default function StepDetails({ selectedNode, executionId }: StepDetailsProps) {
  const [step, setStep] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      loadStepDetails();
    } else {
      setStep(null);
    }
  }, [selectedNode, executionId]);

  const loadStepDetails = async () => {
    if (!selectedNode) return;
    
    setLoading(true);
    try {
      // Get execution details to find step data
      const result = await api.get('/executions');
      
      if (result.success) {
        const executions = result.data.executions || [];
        console.log('Available executions:', executions);
        
        // Use provided executionId or latest execution
        let execution;
        if (executionId) {
          execution = executions.find((e: any) => e.id === executionId);
        } else {
          execution = executions[executions.length - 1]; // Latest execution
        }
        
        console.log('Selected execution:', execution);
        
        if (execution && execution.steps) {
          const stepData = execution.steps.find((s: any) => s.name === selectedNode);
          console.log('Found step data:', stepData);
          
          if (stepData) {
            setStep(stepData);
          } else {
            setStep({
              name: selectedNode,
              status: 'pending',
              input: null,
              output: null,
              logs: [`Step ${selectedNode} not yet executed`]
            });
          }
        } else {
          setStep({
            name: selectedNode,
            status: 'unknown',
            input: null,
            output: null,
            logs: ['No execution data available']
          });
        }
      }
    } catch (error) {
      console.error('Failed to load step details:', error);
      setStep({
        name: selectedNode,
        status: 'error',
        input: null,
        output: null,
        logs: ['Failed to load step details']
      });
    } finally {
      setLoading(false);
    }
  };



  if (!selectedNode) {
    return (
      <div className="step-details">
        <div className="no-selection">
          <h3>No Step Selected</h3>
          <p>Click on a step in the graph to view its details</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="step-details">
        <div className="loading">Loading step details...</div>
      </div>
    );
  }

  if (!step) {
    return (
      <div className="step-details">
        <div className="no-data">
          <h3>{selectedNode}</h3>
          <p>No data available for this step</p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-details">
      <div className="step-header">
        <h3>{step.name}</h3>
        <span className={`status ${step.status}`}>{step.status}</span>
      </div>

      <div className="step-section">
        <h4>Input</h4>
        <div className="code-display">
          {step.input ? (
            <pre>{JSON.stringify(step.input, null, 2)}</pre>
          ) : step.name === 'entry' && step.output ? (
            <div className="empty-state">Entry step input is the execution input</div>
          ) : (
            <div className="empty-state">No input data</div>
          )}
        </div>
      </div>

      <div className="step-section">
        <h4>Output</h4>
        <div className="code-display">
          {step.output ? (
            <pre>{JSON.stringify(step.output, null, 2)}</pre>
          ) : (
            <div className="empty-state">No output data</div>
          )}
        </div>
      </div>

      {step.logs && step.logs.length > 0 && (
        <div className="step-section">
          <h4>Logs</h4>
          <div className="logs">
            {step.logs.map((log: string, index: number) => (
              <div key={index} className="log-entry">{log}</div>
            ))}
          </div>
          
          {/* AI Assistant Button */}
          <button 
            className="ai-analysis-button"
            onClick={() => setAiChatOpen(true)}
            style={{ marginTop: '12px', fontSize: '12px', padding: '8px 16px' }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Assistant
          </button>
        </div>
      )}

      {step.error && (
        <div className="step-section">
          <h4>Error</h4>
          <div className="error-display">
            {step.error}
          </div>
        </div>
      )}

      <AIChatbot
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        executionId={executionId || ''}
        step={step}
      />
    </div>
  );
}
