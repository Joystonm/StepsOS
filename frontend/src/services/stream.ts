const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export const createStream = () => {
  return new WebSocket(WS_URL);
};
