import React from 'react';

interface Execution {
  id: string;
  stepId: string;
  status: string;
  timestamp: string;
  duration?: number;
}

interface ExecutionTimelineProps {
  executions: Execution[];
}

export default function ExecutionTimeline({ executions }: ExecutionTimelineProps) {
  if (!executions || executions.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No execution history available</p>
        <p>Execute steps to see timeline</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button className="timeline-btn">Replay</button>
        <button className="timeline-btn">Pause</button>
      </div>
      
      <div className="timeline-track">
        {executions.map((execution, index) => (
          <div 
            key={execution.id || index}
            className={`timeline-event ${execution.status}`}
            title={`${execution.stepId} - ${execution.status}`}
          >
            <div className="event-marker"></div>
            <div className="event-label">
              {execution.stepId}
            </div>
            <div className="event-time">
              {new Date(execution.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
