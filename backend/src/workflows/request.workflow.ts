import { Workflow } from 'motia';

export const requestWorkflow: Workflow = {
  name: 'request',
  
  steps: [
    {
      name: 'createRequest',
      next: 'validate'
    },
    {
      name: 'validate',
      next: 'process'
    },
    {
      name: 'process',
      next: 'finalize'
    },
    {
      name: 'finalize'
    }
  ],
  
  onStart: (context) => {
    console.log(`Starting request workflow: ${context.executionId}`);
  },
  
  onComplete: (context, result) => {
    console.log(`Request workflow completed: ${context.executionId}`);
  },
  
  onError: (context, error) => {
    console.error(`Request workflow failed: ${context.executionId}`, error);
  }
};
