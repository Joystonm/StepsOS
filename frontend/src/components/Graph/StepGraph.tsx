import React, { useEffect, useRef } from 'react';
import { Graph } from '../../types/graph';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';

interface StepGraphProps {
  graph: Graph;
  onNodeClick?: (nodeId: string) => void;
}

export default function StepGraph({ graph, onNodeClick }: StepGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Auto-layout nodes in a DAG format
    if (svgRef.current && graph.nodes.length > 0) {
      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      
      // Simple vertical layout
      graph.nodes.forEach((node, index) => {
        const x = rect.width / 2;
        const y = 100 + (index * 120);
        node.x = x;
        node.y = y;
      });
    }
  }, [graph]);

  return (
    <div className="step-graph">
      <svg
        ref={svgRef}
        width="100%"
        height="600"
        viewBox="0 0 800 600"
        className="graph-svg"
      >
        {/* Render edges first (behind nodes) */}
        {graph.edges.map((edge, index) => {
          const fromNode = graph.nodes.find(n => n.id === edge.from);
          const toNode = graph.nodes.find(n => n.id === edge.to);
          
          if (!fromNode || !toNode) return null;
          
          return (
            <GraphEdge
              key={`${edge.from}-${edge.to}-${index}`}
              from={{ x: fromNode.x || 0, y: fromNode.y || 0 }}
              to={{ x: toNode.x || 0, y: toNode.y || 0 }}
            />
          );
        })}
        
        {/* Render nodes */}
        {graph.nodes.map((node) => (
          <GraphNode
            key={node.id}
            node={node}
            onClick={() => onNodeClick?.(node.id)}
          />
        ))}
      </svg>
    </div>
  );
}
