import { useState, useEffect } from 'react';
import { createStream } from '../services/stream';

export const useStream = () => {
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    const ws = createStream();
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    return () => ws.close();
  }, []);
  
  return { connected };
};
