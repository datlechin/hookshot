use crate::models::Endpoint;
use crate::websocket::{RequestData, WebSocketManager, WebSocketMessage};
use axum::{
    body::Bytes,
    extract::{ConnectInfo, Path, State},
    http::{HeaderMap, HeaderName, HeaderValue, Method, StatusCode, Uri},
    response::{IntoResponse, Response},
};
use sqlx::SqlitePool;
use std::net::SocketAddr;
use std::str::FromStr;
use std::sync::Arc;
use tracing::{error, info};

const MAX_BODY_SIZE: usize = 10 * 1024 * 1024; // 10MB

/// Webhook capture handler - accepts any HTTP method and stores the request
pub async fn webhook_handler(
    Path(endpoint_id): Path<String>,
    method: Method,
    uri: Uri,
    headers: HeaderMap,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State((pool, ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
    body: Bytes,
) -> Result<Response, StatusCode> {
    // Check body size limit
    if body.len() > MAX_BODY_SIZE {
        info!(
            "Request to endpoint {} rejected: body size {} exceeds limit {}",
            endpoint_id,
            body.len(),
            MAX_BODY_SIZE
        );
        return Err(StatusCode::PAYLOAD_TOO_LARGE);
    }

    // Fetch endpoint from database
    let endpoint = match sqlx::query_as::<_, Endpoint>(
        "SELECT id, created_at, custom_response_enabled, response_status, response_headers, response_body, request_count FROM endpoints WHERE id = ? LIMIT 1"
    )
    .bind(&endpoint_id)
    .fetch_optional(&pool)
    .await
    {
        Ok(Some(ep)) => ep,
        Ok(None) => {
            info!("Request to non-existent endpoint: {}", endpoint_id);
            return Err(StatusCode::NOT_FOUND);
        }
        Err(e) => {
            error!("Database error checking endpoint {}: {}", endpoint_id, e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    // Extract request data
    let http_method = method.as_str();
    let path = uri.path();
    let query_string = uri.query().map(|q| q.to_string());

    // Convert headers to JSON
    let headers_json = headers_to_json(&headers);

    // Extract Content-Type header
    let content_type = headers
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    // Get client IP address
    let ip_address = addr.ip().to_string();

    // Get current timestamp with millisecond precision
    let received_at = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true);

    // Store body as bytes (can be empty)
    let body_bytes = if body.is_empty() {
        None
    } else {
        Some(body.to_vec())
    };

    // Insert request into database asynchronously
    let pool_clone = pool.clone();
    let endpoint_id_clone = endpoint_id.clone();
    let method_str = http_method.to_string();
    let path_str = path.to_string();
    let ws_manager_clone = ws_manager.clone();

    tokio::spawn(async move {
        // Insert the request record
        let insert_result = sqlx::query(
            r#"
            INSERT INTO requests (endpoint_id, method, path, query_string, headers, body, content_type, received_at, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#
        )
        .bind(&endpoint_id_clone)
        .bind(&method_str)
        .bind(&path_str)
        .bind(&query_string)
        .bind(&headers_json)
        .bind(&body_bytes)
        .bind(&content_type)
        .bind(&received_at)
        .bind(&ip_address)
        .execute(&pool_clone)
        .await;

        let request_id = match insert_result {
            Ok(result) => result.last_insert_rowid(),
            Err(e) => {
                error!(
                    "Failed to insert request for endpoint {}: {}",
                    endpoint_id_clone, e
                );
                return;
            }
        };

        // Increment request count for the endpoint
        if let Err(e) =
            sqlx::query("UPDATE endpoints SET request_count = request_count + 1 WHERE id = ?")
                .bind(&endpoint_id_clone)
                .execute(&pool_clone)
                .await
        {
            error!(
                "Failed to increment request count for endpoint {}: {}",
                endpoint_id_clone, e
            );
        }

        info!(
            "Captured {} request to endpoint {} from {}",
            method_str, endpoint_id_clone, ip_address
        );

        // Parse headers JSON string into serde_json::Value
        let headers_value =
            serde_json::from_str(&headers_json).unwrap_or_else(|_| serde_json::json!({}));

        // Parse query string into object
        let query_params_value = if let Some(qs) = &query_string {
            let mut params = serde_json::Map::new();
            for (key, value) in form_urlencoded::parse(qs.as_bytes()) {
                params.insert(
                    key.into_owned(),
                    serde_json::Value::String(value.into_owned()),
                );
            }
            serde_json::Value::Object(params)
        } else {
            serde_json::json!({})
        };

        // Convert body bytes to UTF-8 string if present
        let body_string = body_bytes
            .as_ref()
            .and_then(|bytes| String::from_utf8(bytes.clone()).ok());

        // Broadcast to WebSocket clients
        let ws_message = WebSocketMessage::NewRequest {
            data: RequestData {
                id: request_id,
                endpoint_id: endpoint_id_clone.clone(),
                method: method_str,
                path: path_str,
                query_string: query_string.clone(),
                query_params: query_params_value,
                headers: headers_value,
                body: body_string,
                content_type,
                received_at,
                ip_address: Some(ip_address),
            },
        };

        ws_manager_clone
            .broadcast(&endpoint_id_clone, ws_message)
            .await;
    });

    // Build response based on custom configuration
    if endpoint.custom_response_enabled {
        // Parse custom status code
        let status =
            StatusCode::from_u16(endpoint.response_status as u16).unwrap_or(StatusCode::OK);

        // Parse custom headers if provided
        let mut response_headers = HeaderMap::new();
        response_headers.insert("Access-Control-Allow-Origin", HeaderValue::from_static("*"));

        if let Some(headers_json) = endpoint.response_headers {
            if let Ok(headers_map) =
                serde_json::from_str::<serde_json::Map<String, serde_json::Value>>(&headers_json)
            {
                for (key, value) in headers_map {
                    if let Ok(header_name) = HeaderName::from_str(&key) {
                        if let Some(val_str) = value.as_str() {
                            if let Ok(header_value) = HeaderValue::from_str(val_str) {
                                response_headers.insert(header_name, header_value);
                            }
                        }
                    }
                }
            }
        }

        // Build response body
        let response_body = endpoint.response_body.unwrap_or_default();

        Ok((status, response_headers, response_body).into_response())
    } else {
        // Return default 200 OK response
        Ok((StatusCode::OK, [("Access-Control-Allow-Origin", "*")], "").into_response())
    }
}

/// Convert HeaderMap to JSON string
fn headers_to_json(headers: &HeaderMap) -> String {
    let mut map = serde_json::Map::new();

    for (name, value) in headers.iter() {
        let key = name.as_str().to_string();
        let val = value.to_str().unwrap_or("[binary]").to_string();

        // If header appears multiple times, create an array
        match map.get_mut(&key) {
            Some(serde_json::Value::Array(arr)) => {
                arr.push(serde_json::Value::String(val));
            }
            Some(existing) => {
                let old = existing.clone();
                *existing = serde_json::Value::Array(vec![old, serde_json::Value::String(val)]);
            }
            None => {
                map.insert(key, serde_json::Value::String(val));
            }
        }
    }

    serde_json::to_string(&map).unwrap_or_else(|_| "{}".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::HeaderValue;

    #[test]
    fn test_headers_to_json() {
        let mut headers = HeaderMap::new();
        headers.insert("content-type", HeaderValue::from_static("application/json"));
        headers.insert("user-agent", HeaderValue::from_static("test-agent"));

        let json = headers_to_json(&headers);
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();

        assert_eq!(parsed["content-type"], "application/json");
        assert_eq!(parsed["user-agent"], "test-agent");
    }

    #[test]
    fn test_headers_to_json_multiple_values() {
        let mut headers = HeaderMap::new();
        headers.append("x-custom", HeaderValue::from_static("value1"));
        headers.append("x-custom", HeaderValue::from_static("value2"));

        let json = headers_to_json(&headers);
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();

        assert!(parsed["x-custom"].is_array());
        let arr = parsed["x-custom"].as_array().unwrap();
        assert_eq!(arr.len(), 2);
    }

    #[test]
    fn test_headers_to_json_empty() {
        let headers = HeaderMap::new();
        let json = headers_to_json(&headers);
        assert_eq!(json, "{}");
    }
}
