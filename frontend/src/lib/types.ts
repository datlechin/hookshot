/**
 * Core type definitions for Hookshot frontend
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

/**
 * Endpoint entity
 */
export interface Endpoint {
  id: string
  created_at: string
  custom_response_enabled: boolean
  response_status?: number
  response_headers?: Record<string, string>
  response_body?: string
  forward_url?: string
  max_requests: number
  rate_limit_per_minute?: number
}

/**
 * Request entity (webhook request)
 */
export interface Request {
  id: number
  endpoint_id: string
  method: HttpMethod
  path: string
  query_string?: string
  headers: Record<string, string>
  body?: string
  content_type?: string
  received_at: string
  ip_address: string
}

/**
 * Config for custom response - matches backend UpdateResponseConfig
 */
export interface EndpointConfig {
  enabled: boolean
  status: number
  headers?: string  // JSON string
  body?: string
}

/**
 * WebSocket message types
 */
export interface WebSocketMessage {
  type: 'new_request' | 'endpoint_updated' | 'error'
  data: Request | Endpoint | { message: string }
}

/**
 * API Error class for better error handling
 */
export class ApiError extends Error {
  status: number
  statusText: string
  data?: unknown

  constructor(status: number, statusText: string, data?: unknown) {
    super(`API Error: ${status} ${statusText}`)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

// Legacy type alias for backward compatibility
export type WebhookRequest = Request
