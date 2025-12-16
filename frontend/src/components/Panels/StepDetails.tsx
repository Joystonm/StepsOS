import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface StepDetailsProps {
  selectedNode: string | null;
  executionId: string | null;
}

export default function StepDetails({ selectedNode, executionId }: StepDetailsProps) {
  const [step, setStep] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

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

  const handleAIAnalysis = async () => {
    console.log('AI Analysis clicked', { executionId, step: step?.name });
    if (!executionId || !step) {
      console.log('Missing executionId or step');
      setAiAnalysis('Error: Missing execution or step data');
      return;
    }
    
    setAiAnalyzing(true);
    try {
      console.log('Calling AI analysis API...');
      const result = await api.post('/ai/analyze-step', {
        executionId: executionId,
        stepId: step.name,
        stepData: {
          input: step.input,
          output: step.output,
          logs: step.logs,
          error: step.error,
          status: step.status
        }
      });
      
      console.log('AI Analysis result:', result);
      if (result.success) {
        setAiAnalysis(result.data.data.analysis);
      } else {
        setAiAnalysis(`Analysis failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAiAnalysis('Backend connection failed. Please ensure the backend is running.');
    } finally {
      setAiAnalyzing(false);
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
          
          {/* AI Analysis Button */}
          <button 
            className="ai-analysis-button"
            onClick={handleAIAnalysis}
            disabled={aiAnalyzing}
            style={{ marginTop: '12px', fontSize: '12px', padding: '8px 16px' }}
          >
            {aiAnalyzing ? (
              <>
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Analysis
              </>
            )}
          </button>
          
          {/* AI Analysis Result */}
          {aiAnalysis && (
            <div className="ai-analysis-panel" style={{ marginTop: '12px' }}>
              <div className="flex items-center justify-between mb-2">
                <h5 style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>AI Analysis</h5>
                <button
                  onClick={() => setAiAnalysis(null)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '16px', 
                    color: '#6b7280', 
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#374151'}
                  onMouseOut={(e) => e.target.style.color = '#6b7280'}
                >
                  ✕
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <p style={{ fontSize: '12px', color: '#1e40af' }}>{aiAnalysis}</p>
              </div>
            </div>
          )}
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
    </div>
  );
}
