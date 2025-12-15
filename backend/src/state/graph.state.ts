export interface GraphState {
  nodes: Array<{ id: string; type: string }>;
  edges: Array<{ from: string; to: string }>;
}
