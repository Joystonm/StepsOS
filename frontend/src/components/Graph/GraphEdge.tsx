import React from 'react';

interface GraphEdgeProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export default function GraphEdge({ from, to }: GraphEdgeProps) {
  // Calculate arrow path
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  
  // Adjust start and end points to node edges
  const nodeRadius = 60;
  const startX = from.x + Math.cos(angle) * nodeRadius;
  const startY = from.y + Math.sin(angle) * 25;
  const endX = to.x - Math.cos(angle) * nodeRadius;
  const endY = to.y - Math.sin(angle) * 25;
  
  // Arrow head points
  const arrowLength = 8;
  const arrowAngle = Math.PI / 6;
  const arrowX1 = endX - arrowLength * Math.cos(angle - arrowAngle);
  const arrowY1 = endY - arrowLength * Math.sin(angle - arrowAngle);
  const arrowX2 = endX - arrowLength * Math.cos(angle + arrowAngle);
  const arrowY2 = endY - arrowLength * Math.sin(angle + arrowAngle);

  return (
    <g>
      {/* Edge line */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#6b7280"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
      
      {/* Arrow head */}
      <polygon
        points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        fill="#6b7280"
      />
    </g>
  );
}
