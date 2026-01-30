export interface Endpoint {
  id: string;
  name: string;
  description?: string;
  created_at: string;
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
