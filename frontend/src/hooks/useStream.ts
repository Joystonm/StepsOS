import { useState, useEffect } from 'react';
import { streamManager } from '../services/StreamManager';

export const useStream = () => {
  const [connected, setConnected] = useState(streamManager.isConnected());
  
  useEffect(() => {
    // Subscribe to stream events (React Strict Mode safe)
    const unsubscribe = streamManager.subscribe((event) => {
      console.log('Stream event:', event);
    });

    // Monitor connection state
    const checkConnection = () => {
      setConnected(streamManager.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);

    // Cleanup: ONLY unsubscribe, NEVER close socket
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []); // Empty deps - React Strict Mode safe
  
  return { connected };
};
