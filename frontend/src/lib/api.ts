import type { Endpoint, Request, CreateEndpointRequest, UpdateEndpointRequest } from '@/types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Endpoint API functions
export const endpointsApi = {
  list: () => fetchJSON<Endpoint[]>(`${API_BASE}/endpoints`),

  get: (id: string) => fetchJSON<Endpoint>(`${API_BASE}/endpoints/${id}`),

  create: (data: CreateEndpointRequest) =>
    fetchJSON<Endpoint>(`${API_BASE}/endpoints`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateEndpointRequest) =>
    fetchJSON<Endpoint>(`${API_BASE}/endpoints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetch(`${API_BASE}/endpoints/${id}`, { method: 'DELETE' }).then((res) => {
      if (!res.ok) throw new Error(`Failed to delete endpoint: ${res.status}`);
    }),
};

// Request API functions
export const requestsApi = {
  list: (endpointId: string) =>
    fetchJSON<Request[]>(`${API_BASE}/endpoints/${endpointId}/requests`),

  get: (endpointId: string, requestId: string) =>
    fetchJSON<Request>(`${API_BASE}/endpoints/${endpointId}/requests/${requestId}`),

  delete: (endpointId: string, requestId: string) =>
    fetch(`${API_BASE}/endpoints/${endpointId}/requests/${requestId}`, {
      method: 'DELETE',
    }).then((res) => {
      if (!res.ok) throw new Error(`Failed to delete request: ${res.status}`);
    }),
};
