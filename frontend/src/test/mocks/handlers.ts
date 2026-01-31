/**
 * MSW Request Handlers
 * Mock API responses for testing
 */

import { http, HttpResponse } from 'msw'
import type { Endpoint, Request } from '@/lib/types'

// Mock data
const mockEndpoint: Endpoint = {
  id: 'test-endpoint-123',
  created_at: '2024-01-31T10:00:00Z',
  custom_response_enabled: false,
  response_status: 200,
  response_headers: '{}',
  response_body: '',
  forward_url: '',
  max_requests: 100,
  rate_limit_per_minute: 60,
}

const mockRequest: Request = {
  id: 1,
  endpoint_id: 'test-endpoint-123',
  method: 'POST',
  path: '/webhook/test-endpoint-123',
  query_string: 'foo=bar',
  headers: {
    'content-type': 'application/json',
    'user-agent': 'test-agent',
  },
  body: '{"test": "data"}',
  content_type: 'application/json',
  received_at: '2024-01-31T10:05:00Z',
  ip_address: '127.0.0.1',
}

export const handlers = [
  // Endpoints
  http.get('/api/endpoints', () => {
    return HttpResponse.json([mockEndpoint])
  }),

  http.post('/api/endpoints', () => {
    return HttpResponse.json({
      ...mockEndpoint,
      id: 'new-endpoint-' + Date.now(),
    })
  }),

  http.get('/api/endpoints/:id', ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      ...mockEndpoint,
      id: id as string,
    })
  }),

  http.delete('/api/endpoints/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.put('/api/endpoints/:id/response', async ({ request, params }) => {
    const { id } = params
    const config = await request.json()
    return HttpResponse.json({
      ...mockEndpoint,
      id: id as string,
      custom_response_enabled: (config as any).enabled,
      response_status: (config as any).status,
      response_headers: (config as any).headers,
      response_body: (config as any).body,
    })
  }),

  // Requests
  http.get('/api/endpoints/:endpointId/requests', () => {
    return HttpResponse.json({
      requests: [mockRequest],
      total: 1,
      page: 1,
      limit: 50,
    })
  }),

  http.get('/api/endpoints/:endpointId/requests/:requestId', ({ params }) => {
    const { requestId } = params
    return HttpResponse.json({
      ...mockRequest,
      id: Number(requestId),
    })
  }),

  http.delete('/api/endpoints/:endpointId/requests/:requestId', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete('/api/endpoints/:endpointId/requests', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]

// Export mock data for use in tests
export const mockData = {
  endpoint: mockEndpoint,
  request: mockRequest,
}
