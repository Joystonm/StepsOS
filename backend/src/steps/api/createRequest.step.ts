import { Step } from 'motia';
import { generateId } from '../../utils/id.js';
import { logger } from '../../utils/logger.js';

export const createRequestStep: Step = {
  name: 'createRequest',
  
  async execute(input: { data: any }) {
    logger.info('Creating new request');
    
    const requestId = generateId();
    const timestamp = new Date().toISOString();
    
    return {
      requestId,
      timestamp,
      data: input.data,
      status: 'created'
    };
  },
  
  validate(input: any) {
    return input && typeof input.data !== 'undefined';
  }
};
