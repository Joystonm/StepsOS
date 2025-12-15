export const prompts = {
  explainExecution: `Analyze this StepsOS execution graph and explain:
1. What steps have executed and their current status
2. What the data flow looks like between steps
3. Any potential bottlenecks or issues
4. What will happen next in the execution`,

  analyzeGraph: `Analyze this StepsOS execution graph for:
1. Performance characteristics
2. Dependency relationships
3. Potential failure points
4. Optimization opportunities`,

  debugStep: `Help debug this specific step execution:
1. Why might this step be failing or blocked?
2. What are its dependencies?
3. What would happen if we replay or fork this step?
4. Suggest next debugging actions`
};
