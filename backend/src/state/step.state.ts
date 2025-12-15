export interface StepState {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  output: any;
}
