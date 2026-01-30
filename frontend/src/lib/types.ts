/**
 * Core type definitions for Hookshot frontend
 */

export interface Endpoint {
  id: string
  created_at: string
  custom_response_enabled: boolean
  response_status: number
  response_headers: Record<string, string>
  response_body: string
  forward_url: string | null
  max_requests: number
  rate_limit_per_minute: number
}

export interface WebhookRequest {
  id: number
  endpoint_id: string
  method: string
  path: string
  query_string: string
  headers: Record<string, string>
  body: string
  content_type: string
  received_at: string
  ip_address: string
}

export interface WebSocketMessage {
  type: 'new_request' | 'endpoint_update'
  data: WebhookRequest | Endpoint
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
