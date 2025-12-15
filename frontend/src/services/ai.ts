import { api } from './api';

export const ai = {
  explain: (executionId: string) => api.post('/explain', { executionId }),
  analyze: (graphData: any) => api.post('/analyze', { graphData })
};
