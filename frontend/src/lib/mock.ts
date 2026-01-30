/**
 * Mock data for development without backend
 */

import type { Endpoint, Request } from './types'

/**
 * Mock endpoints for development
 */
export const mockEndpoints: Endpoint[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    created_at: '2026-01-30T08:00:00Z',
    custom_response_enabled: false,
    max_requests: 100,
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    created_at: '2026-01-30T09:00:00Z',
    custom_response_enabled: true,
    response_status: 201,
    response_headers: {
      'X-Custom-Header': 'Custom Value',
      'Content-Type': 'application/json',
    },
    response_body: '{"status": "success", "message": "Custom response"}',
    max_requests: 50,
  },
]

/**
 * Mock requests for development
 */
export const mockRequests: Request[] = [
  {
    id: 1,
    endpoint_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    method: 'POST',
    path: '/webhook/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    query_string: 'source=github&event=push',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'GitHub-Hookshot/abc123',
      'X-GitHub-Event': 'push',
    },
    body: JSON.stringify({
      event: 'push',
      repository: 'user/repo',
      commits: [
        {
          message: 'Initial commit',
          author: 'John Doe',
        },
      ],
    }),
    content_type: 'application/json',
    received_at: '2026-01-30T08:01:00Z',
    ip_address: '140.82.115.1',
  },
  {
    id: 2,
    endpoint_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    method: 'GET',
    path: '/webhook/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    query_string: 'test=true',
    headers: {
      'User-Agent': 'curl/7.68.0',
      Accept: '*/*',
    },
    received_at: '2026-01-30T08:02:00Z',
    ip_address: '127.0.0.1',
  },
  {
    id: 3,
    endpoint_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    method: 'POST',
    path: '/webhook/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Stripe/1.0',
    },
    body: 'event_type=payment.success&amount=1000&currency=usd',
    content_type: 'application/x-www-form-urlencoded',
    received_at: '2026-01-30T08:05:00Z',
    ip_address: '54.187.216.72',
  },
  {
    id: 4,
    endpoint_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    method: 'PUT',
    path: '/webhook/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    headers: {
      'Content-Type': 'application/json',
      'X-Custom-Header': 'test-value',
    },
    body: JSON.stringify({
      action: 'update',
      resource: 'user',
      data: { name: 'Jane Smith', email: 'jane@example.com' },
    }),
    content_type: 'application/json',
    received_at: '2026-01-30T08:10:00Z',
    ip_address: '192.168.1.100',
  },
  {
    id: 5,
    endpoint_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    method: 'DELETE',
    path: '/webhook/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    query_string: 'id=12345',
    headers: {
      'User-Agent': 'Custom-Service/2.0',
      Authorization: 'Bearer token123',
    },
    received_at: '2026-01-30T08:15:00Z',
    ip_address: '10.0.0.50',
  },
]

/**
 * Generate a random mock request for testing
 */
export function generateMockRequest(endpointId: string): Request {
  const methods: Request['method'][] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  const method = methods[Math.floor(Math.random() * methods.length)]

  const id = Math.floor(Math.random() * 100000)
  const now = new Date().toISOString()

  return {
    id,
    endpoint_id: endpointId,
    method,
    path: `/webhook/${endpointId}`,
    query_string: Math.random() > 0.5 ? 'test=true' : undefined,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mock-Client/1.0',
    },
    body:
      method === 'POST' || method === 'PUT' || method === 'PATCH'
        ? JSON.stringify({ timestamp: now, random: Math.random() })
        : undefined,
    content_type: 'application/json',
    received_at: now,
    ip_address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  }
}
