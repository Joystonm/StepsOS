const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3333' : '');

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private isOnline = true;

  async request<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.isOnline = true;
      return { success: true, data };
    } catch (error) {
      this.isOnline = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`API Error [${path}]:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async get<T = any>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T = any>(path: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  async healthCheck(): Promise<boolean> {
    const result = await this.get('/executions');
    return result.success;
  }
}

export const api = new ApiService();

// Legacy compatibility
export const legacyApi = {
  get: async (path: string) => {
    const result = await api.get(path);
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }
    return result.data;
  },
  post: async (path: string, data: any) => {
    const result = await api.post(path, data);
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }
    return result.data;
  }
};
