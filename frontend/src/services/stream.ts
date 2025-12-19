const WS_URL = import.meta.env.VITE_WS_URL || (window.location.hostname === 'localhost' ? 'ws://localhost:3333' : `wss://${window.location.host}`);

export const createStream = () => {
  return new WebSocket(WS_URL);
};
