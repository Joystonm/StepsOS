const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3333';

export const createStream = () => {
  return new WebSocket(WS_URL);
};
