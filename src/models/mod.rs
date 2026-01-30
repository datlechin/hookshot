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

/// Query parameters for GET /api/endpoints/:id/requests
#[derive(Debug, Deserialize)]
pub struct RequestQueryParams {
    #[serde(default = "default_page")]
    pub page: u32,
    #[serde(default = "default_limit")]
    pub limit: u32,
    pub method: Option<String>, // Comma-separated HTTP methods
}

fn default_page() -> u32 {
    1
}

fn default_limit() -> u32 {
    50
}

/// Response for GET /api/endpoints/:id/requests
#[derive(Debug, Serialize)]
pub struct RequestListResponse {
    pub requests: Vec<RequestResponse>,
    pub total: i64,
    pub page: u32,
    pub limit: u32,
}

/// Request body for PUT /api/endpoints/:id/response
#[derive(Debug, Deserialize)]
pub struct UpdateResponseConfig {
    pub enabled: bool,
    pub status: i32,
    pub headers: Option<String>,
    pub body: Option<String>,
}

/// Request with decoded body for API responses
#[derive(Debug, Serialize)]
pub struct RequestResponse {
    pub id: i64,
    pub endpoint_id: String,
    pub method: String,
    pub path: String,
    pub query_params: serde_json::Value,
    pub headers: serde_json::Value,
    pub body: Option<String>, // Base64 encoded or UTF-8 string
    pub content_type: Option<String>,
    pub received_at: String,
    pub ip_address: Option<String>,
}

impl From<Request> for RequestResponse {
    fn from(req: Request) -> Self {
        // Parse headers JSON string into serde_json::Value
        let headers = serde_json::from_str(&req.headers)
            .unwrap_or_else(|_| serde_json::json!({}));

        // Parse query string into object
        let query_params = if let Some(qs) = req.query_string {
            let mut params = serde_json::Map::new();
            for (key, value) in form_urlencoded::parse(qs.as_bytes()) {
                params.insert(key.into_owned(), serde_json::Value::String(value.into_owned()));
            }
            serde_json::Value::Object(params)
        } else {
            serde_json::json!({})
        };

        Self {
            id: req.id,
            endpoint_id: req.endpoint_id,
            method: req.method,
            path: req.path,
            query_params,
            headers,
            body: req.body.map(|b| {
                // Try to decode as UTF-8, otherwise base64
                String::from_utf8(b.clone()).unwrap_or_else(|_| {
                    use base64::{engine::general_purpose, Engine as _};
                    general_purpose::STANDARD.encode(&b)
                })
            }),
            content_type: req.content_type,
            received_at: req.received_at,
            ip_address: req.ip_address,
        }
    }
}
