import React, { useState, useEffect } from 'react';
import StepGraph from '../components/Graph/StepGraph';
import StepDetails from '../components/Panels/StepDetails';
import WorkflowInput from '../components/Controls/WorkflowInput';
import { useGraph } from '../hooks/useGraph';
import { useStream } from '../hooks/useStream';
import { streamManager } from '../services/StreamManager';
import { api } from '../services/api';
import '../styles/execution-graph.css';

interface ConnectionStatus {
  api: boolean;
  websocket: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export default function Dashboard() {
  const { graph, setGraph } = useGraph();
  const { connected } = useStream();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    api: false,
    websocket: 'disconnected'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial connection check
    checkConnections();
    
    // Load initial data
    loadExecutions();
    
    // Subscribe to stream events
    const unsubscribeStream = streamManager.subscribe((event) => {
      setError(null); // Clear errors when receiving data
      
      if (event.event === 'graph:update') {
        setGraph(event.data.graph);
      } else if (event.event === 'execution:update') {
        setExecutions(prev => [...prev, event.data]);
      } else if (event.event === 'step:complete') {
        loadExecutions();
      }
    });

    // Subscribe to connection state changes
    const unsubscribeConnectionState = streamManager.subscribeToConnectionState((state) => {
      setConnectionStatus(prev => ({ ...prev, websocket: state }));
    });
    
    // Periodic connection check
    const connectionCheckInterval = setInterval(checkConnections, 10000);
    
    return () => {
      unsubscribeStream();
      unsubscribeConnectionState();
      clearInterval(connectionCheckInterval);
    };
  }, []);

  const checkConnections = async () => {
    const apiStatus = await api.healthCheck();
    setConnectionStatus(prev => ({ ...prev, api: apiStatus }));
  };

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const result = await api.get('/executions');
      
      if (result.success) {
        setExecutions(result.data.executions || []);
        if (result.data.graph) {
          console.log('Setting graph data:', result.data.graph);
          setGraph(result.data.graph);
        } else {
          console.log('No graph data in response:', result.data);
        }
        setError(null);
      } else {
        setError(`Failed to load executions: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load executions: ${errorMessage}`);
      console.error('Failed to load executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const handleWorkflowSubmit = async (executionId: string) => {
    // This is called after execution starts, just update the current execution ID
    setCurrentExecutionId(executionId);
    // Refresh executions after a brief delay
    setTimeout(loadExecutions, 1000);
  };

  const handleAIAnalysis = async () => {
    if (!currentExecutionId) return;
    
    setAiAnalyzing(true);
    try {
      const result = await api.post('/ai/analyze', {
        executionId: currentExecutionId
      });
      
      if (result.success) {
        setAiAnalysis(result.data.analysis);
      } else {
        setError(`AI Analysis failed: ${result.error}`);
      }
    } catch (error) {
      setError(`AI Analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const retryConnection = () => {
    setError(null);
    streamManager.resetReconnectAttempts();
    streamManager.connect().catch(error => {
      setError(`Connection retry failed: ${error.message}`);
    });
    checkConnections();
    loadExecutions();
  };

  // Connection status indicator
  const renderConnectionStatus = () => {
    return null;
  };

  // Error banner
  const renderErrorBanner = () => {
    if (!error) return null;
    
    return (
      <div className="error-banner">
        <span>⚠️ {error}</span>
        <button onClick={retryConnection} className="retry-button">
          Retry Connection
        </button>
      </div>
    );
  };

  // Offline fallback UI
  if (!connectionStatus.api && !loading) {
    return (
      <div className="dashboard offline">
        <div className="offline-message">
          <h2>🔌 Backend Connection Lost</h2>
          <p>Cannot connect to StepsOS backend at {import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3333' : window.location.origin)}</p>
          <div className="offline-actions">
            <button onClick={retryConnection} className="retry-button">
              Retry Connection
            </button>
            <div className="troubleshooting">
              <h3>Troubleshooting:</h3>
              <ul>
                <li>Ensure the backend server is running: <code>node start-backend.js</code></li>
                <li>Check if port 3333 is available</li>
                <li>Verify no firewall is blocking the connection</li>
              </ul>
            </div>
          </div>
          {renderConnectionStatus()}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {renderConnectionStatus()}
      {renderErrorBanner()}
      
      <div className="dashboard-header">

        {loading && <div className="loading-indicator">Loading...</div>}
      </div>

      <div className="dashboard-content">
        <div className="left-panel">
          <WorkflowInput onExecutionStart={handleWorkflowSubmit} />
          

          
          <div className="executions-list">
            <h3>Recent Executions ({executions.length})</h3>
            {executions.length === 0 ? (
              <p>No executions yet. Submit a workflow to get started.</p>
            ) : (
              executions.slice(-5).reverse().map((execution, index) => (
                <div key={execution.id || index} className="execution-item">
                  <span className={`status ${execution.status}`}>
                    {execution.status || 'unknown'}
                  </span>
                  <span className="id">{execution.id || 'unknown'}</span>
                </div>
              ))
            )}
          </div>
          
          {/* AI Analysis Panel */}
          {aiAnalysis && (
            <div className="ai-analysis-panel">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">AI Analysis</h3>
                <button
                  onClick={() => setAiAnalysis(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ×
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-900">{aiAnalysis}</p>
              </div>
            </div>
          )}
        </div>

        <div className="center-panel">
          <StepGraph 
            graph={graph} 
            onNodeClick={handleNodeClick}
            selectedNode={selectedNode}
          />
        </div>

        <div className="right-panel">
          <StepDetails 
            selectedNode={selectedNode}
            executionId={currentExecutionId}
          />
        </div>
      </div>
    </div>
  );
}
