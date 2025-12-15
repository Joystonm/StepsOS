import { Step } from 'motia';
import { groq } from '../../ai/groq.client.js';
import { prompts } from '../../ai/prompts.js';
import { logger } from '../../utils/logger.js';

export const explainExecutionStep: Step = {
  name: 'explainExecution',
  
  async execute(input: { executionId: string; graph: any; question?: string }) {
    logger.info(`Explaining execution ${input.executionId}`);
    
    const prompt = input.question || prompts.explainExecution;
    const context = JSON.stringify(input.graph, null, 2);
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI that explains backend execution graphs. Be concise and technical.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nExecution Graph:\n${context}`
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.1
    });
    
    return {
      executionId: input.executionId,
      explanation: completion.choices[0]?.message?.content || 'No explanation available',
      explainedAt: new Date().toISOString()
    };
  }
};
