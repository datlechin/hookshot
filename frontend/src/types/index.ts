export interface Endpoint {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  custom_response_enabled: boolean;
  response_status: number;
  response_headers: string | null;
  response_body: string | null;
}

export interface Request {
  id: string;
  endpoint_id: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  query_params: Record<string, string>;
  received_at: string;
}

export interface CreateEndpointRequest {
  name: string;
  description?: string;
}

export interface UpdateEndpointRequest {
  name?: string;
  description?: string;
}
