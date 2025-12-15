import { Step } from 'motia';
import { logger } from '../../utils/logger.js';

export const validateStep: Step = {
  name: 'validate',
  
  async execute(input: { requestId: string; data: any }) {
    logger.info(`Validating request ${input.requestId}`);
    
    // Validation logic
    const isValid = input.data && Object.keys(input.data).length > 0;
    
    if (!isValid) {
      throw new Error('Invalid request data');
    }
    
    return {
      ...input,
      valid: true,
      validatedAt: new Date().toISOString()
    };
  },
  
  validate(input: any) {
    return input && input.requestId && input.data;
  }
};
