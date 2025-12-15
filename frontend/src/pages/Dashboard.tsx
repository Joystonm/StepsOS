import React, { useState, useEffect } from 'react';
import StepGraph from '../components/Graph/StepGraph';
import ExecutionTimeline from '../components/Timeline/ExecutionTimeline';
import StepDetails from '../components/Panels/StepDetails';
import ReplayButton from '../components/Controls/ReplayButton';
import PauseButton from '../components/Controls/PauseButton';
import { useGraph } from '../hooks/useGraph';
import { useStream } from '../hooks/useStream';
import { api } from '../services/api';

export default function Dashboard() {
  const { graph, setGraph } = useGraph();
  const { connected } = useStream();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [executions, setExecutions] = useState<any[]>([]);

  useEffect(() => {
    // Load initial data
    loadExecutions();
    
    // Set up real-time updates
    const ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:3000');
    
    ws.onmessage = (event) => {
      const { event: eventType, data } = JSON.parse(event.data);
      
      if (eventType === 'graph:update') {
        setGraph(data.graph);
      } else if (eventType === 'execution:update') {
        setExecutions(prev => [...prev, data]);
      }
    };
    
    return () => ws.close();
  }, []);

  const loadExecutions = async () => {
    try {
      const data = await api.get('/executions');
      setExecutions(data.executions || []);
      if (data.graph) {
        setGraph(data.graph);
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const handleReplay = async () => {
    try {
      await api.post('/replay', { executionId: selectedNode });
    } catch (error) {
      console.error('Failed to replay:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>StepsOS</h1>
        <div className="status">
          <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '🟢 Live' : '🔴 Disconnected'}
          </span>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="main-panel">
          <div className="graph-container">
            <h2>Execution Graph</h2>
            <StepGraph graph={graph} onNodeClick={handleNodeClick} />
          </div>
          
          <div className="timeline-container">
            <h2>Execution Timeline</h2>
            <ExecutionTimeline executions={executions} />
          </div>
        </div>

        <div className="side-panel">
          <div className="controls">
            <ReplayButton onClick={handleReplay} disabled={!selectedNode} />
            <PauseButton />
          </div>
          
          {selectedNode && (
            <StepDetails stepId={selectedNode} />
          )}
        </div>
      </div>
    </div>
  );
}
