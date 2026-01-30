/**
 * API client for Hookshot backend with retry logic and error handling
 */

import { ApiError } from './types'
import type { Endpoint, Request, EndpointConfig } from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const DEFAULT_TIMEOUT = 30000 // 30 seconds

/**
 * Sleep utility for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generic request wrapper with error handling and retry logic
 */
async function request<T>(
  endpoint: string,
  options?: RequestInit,
  retries = 3
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new ApiError(response.status, response.statusText, data)
      }

      // Handle empty responses (204 No Content, DELETE operations)
      if (response.status === 204 || options?.method === 'DELETE') {
        return undefined as T
      }

      return response.json()
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error
      }

      // Don't retry on the last attempt
      if (attempt === retries) {
        break
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000)
      await sleep(delay)
    }
  }

  clearTimeout(timeoutId)
  throw lastError || new Error('Request failed')
}

/**
 * API client organized by resource
 */
export const api = {
  endpoints: {
    /**
     * List all endpoints
     */
    list: () => request<Endpoint[]>('/api/endpoints'),

    /**
     * Create a new endpoint
     */
    create: () => request<Endpoint>('/api/endpoints', { method: 'POST' }),

    /**
     * Get a specific endpoint
     */
    get: (id: string) => request<Endpoint>(`/api/endpoints/${id}`),

    /**
     * Delete an endpoint
     */
    delete: (id: string) =>
      request<void>(`/api/endpoints/${id}`, { method: 'DELETE' }),

    /**
     * Update endpoint configuration
     */
    updateConfig: (id: string, config: EndpointConfig) =>
      request<Endpoint>(`/api/endpoints/${id}/config`, {
        method: 'PUT',
        body: JSON.stringify(config),
      }),
  },

  requests: {
    /**
     * List all requests for an endpoint
     */
    list: async (endpointId: string) => {
      const response = await request<{ requests: Request[]; total: number; page: number; limit: number }>(`/api/endpoints/${endpointId}/requests`);
      // Backend returns paginated response, extract the requests array
      return response.requests;
    },

    /**
     * Get a specific request
     */
    get: (endpointId: string, requestId: number) =>
      request<Request>(`/api/endpoints/${endpointId}/requests/${requestId}`),

    /**
     * Delete a specific request
     */
    delete: (endpointId: string, requestId: number) =>
      request<void>(`/api/endpoints/${endpointId}/requests/${requestId}`, {
        method: 'DELETE',
      }),

    /**
     * Clear all requests for an endpoint
     */
    clear: (endpointId: string) =>
      request<void>(`/api/endpoints/${endpointId}/requests`, {
        method: 'DELETE',
      }),
  },
}

// Legacy export for backward compatibility
class ApiClient {
  async createEndpoint(): Promise<Endpoint> {
    return api.endpoints.create()
  }

  async getEndpoint(id: string): Promise<Endpoint> {
    return api.endpoints.get(id)
  }

  async updateEndpoint(id: string, config: EndpointConfig): Promise<Endpoint> {
    return api.endpoints.updateConfig(id, config)
  }

  async getRequests(endpointId: string): Promise<Request[]> {
    return api.requests.list(endpointId)
  }

  async getRequest(endpointId: string, requestId: number): Promise<Request> {
    return api.requests.get(endpointId, requestId)
  }

  async deleteRequest(endpointId: string, requestId: number): Promise<void> {
    return api.requests.delete(endpointId, requestId)
  }

  async clearRequests(endpointId: string): Promise<void> {
    return api.requests.clear(endpointId)
  }
}

export const apiClient = new ApiClient()
