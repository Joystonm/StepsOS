export interface ExecutionState {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: string[];
}
