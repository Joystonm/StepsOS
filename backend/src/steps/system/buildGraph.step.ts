import { Step } from 'motia';
import { logger } from '../../utils/logger.js';

export const buildGraphStep: Step = {
  name: 'buildGraph',
  
  async execute(input: { executionId: string }) {
    logger.info(`Building execution graph for ${input.executionId}`);
    
    // Build DAG from execution history
    const nodes = [
      { id: 'start', type: 'entry', status: 'completed' },
      { id: 'validate', type: 'workflow', status: 'running' },
      { id: 'process', type: 'workflow', status: 'pending' }
    ];
    
    const edges = [
      { from: 'start', to: 'validate' },
      { from: 'validate', to: 'process' }
    ];
    
    return {
      executionId: input.executionId,
      graph: { nodes, edges },
      builtAt: new Date().toISOString()
    };
  }
};
