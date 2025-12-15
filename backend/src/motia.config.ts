export const config = {
  port: process.env.PORT || 3000,
  steps: './steps',
  workflows: './workflows',
  durability: {
    enabled: true,
    storage: 'memory' // Use persistent storage in production
  },
  streaming: {
    enabled: true,
    events: ['step:start', 'step:complete', 'step:error', 'workflow:start', 'workflow:complete']
  },
  observability: {
    enabled: true,
    realTime: true
  }
};
