import React from 'react';

interface GraphNodeProps {
  node: {
    id: string;
    type: string;
    status?: 'pending' | 'running' | 'completed' | 'failed';
    x?: number;
    y?: number;
  };
  onClick?: () => void;
}

export default function GraphNode({ node, onClick }: GraphNodeProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'running': return '⚡';
      case 'completed': return '✓';
      case 'failed': return '✗';
      case 'pending': return '⏳';
      default: return '○';
    }
  };

  return (
    <g
      transform={`translate(${node.x || 0}, ${node.y || 0})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Node background */}
      <rect
        x="-60"
        y="-25"
        width="120"
        height="50"
        rx="8"
        fill={getStatusColor(node.status)}
        fillOpacity="0.1"
        stroke={getStatusColor(node.status)}
        strokeWidth="2"
      />
      
      {/* Status icon */}
      <text
        x="-45"
        y="5"
        fontSize="16"
        textAnchor="middle"
        fill={getStatusColor(node.status)}
      >
        {getStatusIcon(node.status)}
      </text>
      
      {/* Node label */}
      <text
        x="0"
        y="5"
        fontSize="12"
        textAnchor="middle"
        fill="#374151"
        fontWeight="500"
      >
        {node.id}
      </text>
      
      {/* Node type */}
      <text
        x="0"
        y="-10"
        fontSize="10"
        textAnchor="middle"
        fill="#6b7280"
      >
        {node.type}
      </text>
    </g>
  );
}
