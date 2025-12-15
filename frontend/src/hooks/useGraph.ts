import { useState } from 'react';

export const useGraph = () => {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  return { graph, setGraph };
};
