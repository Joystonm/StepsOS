export interface GraphNode {
  id: string;
  type: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  x?: number;
  y?: number;
  input?: any;
  output?: any;
  logs?: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
