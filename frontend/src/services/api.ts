const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  get: (path: string) => fetch(`${API_URL}${path}`).then(r => r.json()),
  post: (path: string, data: any) => fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json())
};
