import React, { useEffect, useRef } from 'react';
import { Graph } from '../../types/graph';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';

interface StepGraphProps {
  graph: Graph;
  onNodeClick?: (nodeId: string) => void;
  selectedNode?: string | null;
}

export default function StepGraph({ graph, onNodeClick, selectedNode }: StepGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Auto-layout nodes in a DAG format
    if (svgRef.current && graph.nodes.length > 0) {
      // Simple vertical layout with proper positioning
      graph.nodes.forEach((node, index) => {
        node.x = 400; // Center horizontally
        node.y = 100 + (index * 120); // Vertical spacing
      });
    }
  }, [graph]);

  // Debug logging
  console.log('StepGraph render:', { 
    hasGraph: !!graph, 
    nodeCount: graph?.nodes?.length || 0, 
    edgeCount: graph?.edges?.length || 0 
  });

  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return (
      <div className="step-graph">
        <div className="graph-placeholder">
          <div className="placeholder-content">
            <h3>No Execution Graph</h3>
            <p>Start a workflow to see the execution flow</p>
            <div className="placeholder-graph">
              <svg width="300" height="200" viewBox="0 0 300 200">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <circle cx="150" cy="50" r="20" fill="rgba(96, 165, 250, 0.3)" stroke="rgba(96, 165, 250, 0.6)" strokeWidth="2"/>
                <circle cx="150" cy="100" r="20" fill="rgba(34, 197, 94, 0.3)" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="2"/>
                <circle cx="150" cy="150" r="20" fill="rgba(168, 85, 247, 0.3)" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="2"/>
                <line x1="150" y1="70" x2="150" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                <line x1="150" y1="120" x2="150" y2="130" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="step-graph">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="graph-svg"
      >
        {/* Render edges first (behind nodes) */}
        {graph.edges?.map((edge, index) => {
          const fromNode = graph.nodes.find(n => n.id === edge.from);
          const toNode = graph.nodes.find(n => n.id === edge.to);
          
          if (!fromNode || !toNode) return null;
          
          return (
            <GraphEdge
              key={`${edge.from}-${edge.to}-${index}`}
              from={{ x: fromNode.x || 400, y: fromNode.y || 100 }}
              to={{ x: toNode.x || 400, y: toNode.y || 220 }}
            />
          );
        })}
        
        {/* Render nodes */}
        {graph.nodes.map((node) => (
          <GraphNode
            key={node.id}
            node={{
              ...node,
              x: node.x || 400,
              y: node.y || 100
            }}
            onClick={() => {
              console.log('Node clicked:', node.id);
              onNodeClick?.(node.id);
            }}
            isSelected={selectedNode === node.id}
          />
        ))}
      </svg>
    </div>
  );
}
