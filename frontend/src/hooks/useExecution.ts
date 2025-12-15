import { useState } from 'react';

export const useExecution = () => {
  const [execution, setExecution] = useState(null);
  return { execution, setExecution };
};
