import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AIChatbot.css';

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  executionId: string;
  step?: any;
}

interface AnalysisData {
  summary: string;
  fixes: string[];
  improvements: string[];
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose, executionId, step }) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !analysis) {
      generateAnalysis();
    }
  }, [isOpen]);

  const generateAnalysis = async () => {
    if (!step) return;
    
    setIsLoading(true);
    try {
      // Get step analysis
      const analysisResult = await api.post('/ai/analyze-step', {
        executionId,
        stepId: step.name,
        stepData: {
          input: step.input,
          output: step.output,
          logs: step.logs,
          error: step.error,
          status: step.status
        }
      });

      // Get auto-recovery suggestions if step failed
      let recoveryResult = null;
      if (step.status === 'failed') {
        recoveryResult = await api.post('/ai/auto-recovery', {
          executionId,
          stepId: step.name,
          stepData: step
        });
      }

      // Get improvement suggestions
      const improvementResult = await api.post('/ai/improvements', {
        executionId,
        stepId: step.name,
        stepData: step
      });

      console.log('Analysis result:', analysisResult);
      if (analysisResult.success) {
        setAnalysis({
          summary: (analysisResult.data?.data?.data?.analysis || analysisResult.data?.data?.analysis || 'No analysis available').replace('🤖 GROQ AI: ', ''),
          fixes: recoveryResult?.success ? [recoveryResult.data.suggestion] : [],
          improvements: improvementResult?.success ? improvementResult.data.suggestions : []
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis({
        summary: 'Analysis unavailable. Please check backend connection.',
        fixes: [],
        improvements: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chatbot-overlay">
      <div className="ai-chatbot-container">
        <div className="ai-chatbot-header">
          <div className="ai-chatbot-title">
            <div className="ai-avatar">📊</div>
            <div>
              <h3>Analysis Report</h3>
            </div>
          </div>
          <button onClick={onClose} className="ai-chatbot-close">✕</button>
        </div>

        <div className="ai-analysis-content">
          {isLoading ? (
            <div className="loading-section">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
              <p>Analyzing step execution...</p>
            </div>
          ) : analysis ? (
            <>
              {/* Summary Section */}
              <div className="analysis-section">
                <h4>📊 Summary</h4>
                <div className="analysis-card">
                  <p>{analysis.summary}</p>
                </div>
              </div>

              {/* Improvements */}
              {analysis?.improvements?.length > 0 && (
                <div className="analysis-section">
                  <h4>💡 Improvements</h4>
                  {analysis.improvements.map((improvement, index) => (
                    <div key={index} className="analysis-card improvement-card">
                      <p>{improvement}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="error-section">
              <p>Unable to generate analysis. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
