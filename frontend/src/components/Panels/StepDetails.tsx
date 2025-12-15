import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ai } from '../../services/ai';

interface StepDetailsProps {
  stepId: string;
}

export default function StepDetails({ stepId }: StepDetailsProps) {
  const [step, setStep] = useState<any>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStepDetails();
  }, [stepId]);

  const loadStepDetails = async () => {
    try {
      const data = await api.get(`/steps/${stepId}`);
      setStep(data);
    } catch (error) {
      console.error('Failed to load step details:', error);
    }
  };

  const explainStep = async () => {
    setLoading(true);
    try {
      const result = await ai.explain(stepId);
      setExplanation(result.explanation);
    } catch (error) {
      console.error('Failed to get explanation:', error);
      setExplanation('Failed to get AI explanation');
    } finally {
      setLoading(false);
    }
  };

  if (!step) {
    return <div className="step-details loading">Loading step details...</div>;
  }

  return (
    <div className="step-details">
      <div className="step-header">
        <h3>{step.name}</h3>
        <span className={`status ${step.status}`}>{step.status}</span>
      </div>

      <div className="step-section">
        <h4>Input</h4>
        <pre className="code-block">
          {JSON.stringify(step.input, null, 2)}
        </pre>
      </div>

      <div className="step-section">
        <h4>Output</h4>
        <pre className="code-block">
          {JSON.stringify(step.output, null, 2)}
        </pre>
      </div>

      {step.logs && step.logs.length > 0 && (
        <div className="step-section">
          <h4>Logs</h4>
          <div className="logs">
            {step.logs.map((log: string, index: number) => (
              <div key={index} className="log-entry">{log}</div>
            ))}
          </div>
        </div>
      )}

      <div className="step-section">
        <h4>AI Explanation</h4>
        <button 
          onClick={explainStep} 
          disabled={loading}
          className="explain-button"
        >
          {loading ? 'Explaining...' : 'Explain This Step'}
        </button>
        {explanation && (
          <div className="explanation">
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
}
