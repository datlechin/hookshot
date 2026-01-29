use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Endpoint model
#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Endpoint {
    pub id: String,
    pub created_at: String,
    pub custom_response_enabled: bool,
    pub response_status: i32,
    pub response_headers: Option<String>,
    pub response_body: Option<String>,
    pub request_count: i32,
}

/// Request model
#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Request {
    pub id: i64,
    pub endpoint_id: String,
    pub method: String,
    pub path: String,
    pub query_string: Option<String>,
    pub headers: String,
    pub body: Option<Vec<u8>>,
    pub content_type: Option<String>,
    pub received_at: String,
    pub ip_address: Option<String>,
}

/// Response for creating a new endpoint
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateEndpointResponse {
    pub id: String,
}

/// Summary endpoint data for list view
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct EndpointSummary {
    pub id: String,
    pub created_at: String,
    pub request_count: i32,
}
