/**
 * API client for Hookshot backend
 */

import type { Endpoint, WebhookRequest } from './types.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Create a new webhook endpoint
   */
  async createEndpoint(): Promise<Endpoint> {
    const response = await fetch(`${this.baseUrl}/api/endpoints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to create endpoint')
    }
    return response.json()
  }

  /**
   * Get endpoint details
   */
  async getEndpoint(id: string): Promise<Endpoint> {
    const response = await fetch(`${this.baseUrl}/api/endpoints/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch endpoint')
    }
    return response.json()
  }

  /**
   * Update endpoint configuration
   */
  async updateEndpoint(id: string, data: Partial<Endpoint>): Promise<Endpoint> {
    const response = await fetch(`${this.baseUrl}/api/endpoints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update endpoint')
    }
    return response.json()
  }

  /**
   * Get all requests for an endpoint
   */
  async getRequests(endpointId: string): Promise<WebhookRequest[]> {
    const response = await fetch(`${this.baseUrl}/api/endpoints/${endpointId}/requests`)
    if (!response.ok) {
      throw new Error('Failed to fetch requests')
    }
    return response.json()
  }

  /**
   * Get a specific request
   */
  async getRequest(endpointId: string, requestId: number): Promise<WebhookRequest> {
    const response = await fetch(
      `${this.baseUrl}/api/endpoints/${endpointId}/requests/${requestId}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch request')
    }
    return response.json()
  }

  /**
   * Delete a request
   */
  async deleteRequest(endpointId: string, requestId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/endpoints/${endpointId}/requests/${requestId}`,
      {
        method: 'DELETE',
      }
    )
    if (!response.ok) {
      throw new Error('Failed to delete request')
    }
  }

  /**
   * Clear all requests for an endpoint
   */
  async clearRequests(endpointId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/endpoints/${endpointId}/requests`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to clear requests')
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
