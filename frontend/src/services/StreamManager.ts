type StreamEvent = {
  event: string;
  data: any;
  timestamp?: string;
};

type EventListener = (event: StreamEvent) => void;
type ConnectionStateListener = (state: 'disconnected' | 'connecting' | 'connected' | 'error') => void;

class StreamManager {
  private static instance: StreamManager;
  private ws: WebSocket | null = null;
  private listeners = new Set<EventListener>();
  private connectionStateListeners = new Set<ConnectionStateListener>();
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): StreamManager {
    if (!StreamManager.instance) {
      StreamManager.instance = new StreamManager();
    }
    return StreamManager.instance;
  }

  private setConnectionState(state: 'disconnected' | 'connecting' | 'connected' | 'error') {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.connectionStateListeners.forEach(listener => listener(state));
    }
  }

  connect(): Promise<void> {
    if (this.connectionState === 'connected') {
      return Promise.resolve();
    }

    if (this.connectionState === 'connecting') {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
        const checkConnection = () => {
          if (this.connectionState === 'connected') {
            clearTimeout(timeout);
            resolve();
          } else if (this.connectionState === 'error' || this.connectionState === 'disconnected') {
            clearTimeout(timeout);
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    return new Promise((resolve, reject) => {
      this.setConnectionState('connecting');
      
      try {
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3333';
        console.log(`StreamManager: Connecting to ${wsUrl}`);
        this.ws = new WebSocket(wsUrl);
        
        const connectionTimeout = setTimeout(() => {
          if (this.connectionState === 'connecting') {
            console.error('StreamManager: Connection timeout');
            this.setConnectionState('error');
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('StreamManager: WebSocket connected');
          this.setConnectionState('connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const streamEvent: StreamEvent = JSON.parse(event.data);
            this.listeners.forEach(listener => {
              try {
                listener(streamEvent);
              } catch (error) {
                console.error('StreamManager: Listener error', error);
              }
            });
          } catch (error) {
            console.error('StreamManager: Failed to parse message', error);
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log(`StreamManager: WebSocket closed (code: ${event.code}, reason: ${event.reason})`);
          this.setConnectionState('disconnected');
          this.ws = null;
          
          if (event.code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('StreamManager: WebSocket error', error);
          this.setConnectionState('error');
          reject(new Error('WebSocket connection failed'));
        };

      } catch (error) {
        this.setConnectionState('error');
        reject(error);
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
      
      console.log(`StreamManager: Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(error => {
          console.error('StreamManager: Reconnection failed', error);
        });
      }, delay);
    } else {
      console.error('StreamManager: Max reconnection attempts reached');
      this.setConnectionState('error');
    }
  }

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    
    // Auto-connect when first listener subscribes
    if (this.listeners.size === 1 && this.connectionState === 'disconnected') {
      this.connect().catch(error => {
        console.error('StreamManager: Auto-connect failed', error);
      });
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeToConnectionState(listener: ConnectionStateListener): () => void {
    this.connectionStateListeners.add(listener);
    // Immediately call with current state
    listener(this.connectionState);
    
    return () => {
      this.connectionStateListeners.delete(listener);
    };
  }

  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  getConnectionState(): string {
    return this.connectionState;
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.setConnectionState('disconnected');
    this.reconnectAttempts = 0;
  }

  // Reset connection attempts (useful for manual retry)
  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }
}

export const streamManager = StreamManager.getInstance();
