export interface Execution {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: string[];
}
