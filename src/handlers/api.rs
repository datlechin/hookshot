use crate::models::{Request, RequestListResponse, RequestQueryParams, RequestResponse, UpdateResponseConfig};
use crate::websocket::WebSocketManager;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use sqlx::SqlitePool;
use std::sync::Arc;

/// Handler for GET /api/endpoints/:id/requests
/// Returns paginated list of requests for an endpoint with optional method filtering
pub async fn get_endpoint_requests(
    Path(endpoint_id): Path<String>,
    Query(params): Query<RequestQueryParams>,
    State((pool, _ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
) -> Result<Json<RequestListResponse>, StatusCode> {
    // Validate pagination parameters
    let page = params.page.max(1);
    let limit = params.limit.min(100).max(1); // Cap at 100 to prevent abuse
    let offset = (page - 1) * limit;

    // Check if endpoint exists
    let endpoint_exists: Option<(i64,)> =
        sqlx::query_as("SELECT 1 FROM endpoints WHERE id = ?")
            .bind(&endpoint_id)
            .fetch_optional(&pool)
            .await
            .map_err(|e| {
                tracing::error!("Database error checking endpoint: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

    if endpoint_exists.is_none() {
        return Err(StatusCode::NOT_FOUND);
    }

    // Build query with optional method filter
    let (query, count_query) = if let Some(methods) = &params.method {
        // Parse comma-separated methods
        let method_list: Vec<&str> = methods.split(',').map(|s| s.trim()).collect();
        let placeholders = method_list
            .iter()
            .map(|_| "?")
            .collect::<Vec<_>>()
            .join(",");

        // Build SQL with IN clause for method filtering
        let query = format!(
            "SELECT * FROM requests 
             WHERE endpoint_id = ? AND method IN ({}) 
             ORDER BY received_at DESC 
             LIMIT ? OFFSET ?",
            placeholders
        );

        let count_query = format!(
            "SELECT COUNT(*) FROM requests 
             WHERE endpoint_id = ? AND method IN ({})",
            placeholders
        );

        (query, count_query)
    } else {
        // No method filter
        (
            "SELECT * FROM requests 
             WHERE endpoint_id = ? 
             ORDER BY received_at DESC 
             LIMIT ? OFFSET ?"
                .to_string(),
            "SELECT COUNT(*) FROM requests 
             WHERE endpoint_id = ?"
                .to_string(),
        )
    };

    // Execute count query to get total
    let total: i64 = if let Some(methods) = &params.method {
        let method_list: Vec<&str> = methods.split(',').map(|s| s.trim()).collect();
        let mut count_builder = sqlx::query_scalar(&count_query);
        count_builder = count_builder.bind(&endpoint_id);
        for method in method_list {
            count_builder = count_builder.bind(method);
        }
        count_builder.fetch_one(&pool).await.map_err(|e| {
            tracing::error!("Database error counting requests: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?
    } else {
        sqlx::query_scalar(&count_query)
            .bind(&endpoint_id)
            .fetch_one(&pool)
            .await
            .map_err(|e| {
                tracing::error!("Database error counting requests: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?
    };

    // Execute main query to get requests
    let requests: Vec<Request> = if let Some(methods) = &params.method {
        let method_list: Vec<&str> = methods.split(',').map(|s| s.trim()).collect();
        let mut query_builder = sqlx::query_as(&query);
        query_builder = query_builder.bind(&endpoint_id);
        for method in method_list {
            query_builder = query_builder.bind(method);
        }
        query_builder = query_builder.bind(limit as i64).bind(offset as i64);
        query_builder.fetch_all(&pool).await.map_err(|e| {
            tracing::error!("Database error fetching requests: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?
    } else {
        sqlx::query_as(&query)
            .bind(&endpoint_id)
            .bind(limit as i64)
            .bind(offset as i64)
            .fetch_all(&pool)
            .await
            .map_err(|e| {
                tracing::error!("Database error fetching requests: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?
    };

    // Convert to response format
    let request_responses: Vec<RequestResponse> =
        requests.into_iter().map(RequestResponse::from).collect();

    Ok(Json(RequestListResponse {
        requests: request_responses,
        total,
        page,
        limit,
    }))
}

/// Handler for GET /api/requests/:id
/// Returns full details of a single request
pub async fn get_request_by_id(
    Path(request_id): Path<i64>,
    State((pool, _ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
) -> Result<Json<RequestResponse>, StatusCode> {
    let request: Request = sqlx::query_as("SELECT * FROM requests WHERE id = ?")
        .bind(request_id)
        .fetch_optional(&pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error fetching request: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(RequestResponse::from(request)))
}

/// Handler for DELETE /api/endpoints/:id
/// Deletes an endpoint and all associated requests (cascade)
pub async fn delete_endpoint(
    Path(endpoint_id): Path<String>,
    State((pool, _ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
) -> Result<StatusCode, StatusCode> {
    // Check if endpoint exists
    let endpoint_exists: Option<(i64,)> =
        sqlx::query_as("SELECT 1 FROM endpoints WHERE id = ?")
            .bind(&endpoint_id)
            .fetch_optional(&pool)
            .await
            .map_err(|e| {
                tracing::error!("Database error checking endpoint: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

    if endpoint_exists.is_none() {
        return Err(StatusCode::NOT_FOUND);
    }

    // Delete endpoint (cascade will delete requests)
    sqlx::query("DELETE FROM endpoints WHERE id = ?")
        .bind(&endpoint_id)
        .execute(&pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error deleting endpoint: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    tracing::info!("Deleted endpoint {} and all associated requests", endpoint_id);

    Ok(StatusCode::NO_CONTENT)
}

/// Handler for PUT /api/endpoints/:id/response
/// Updates custom response configuration for an endpoint
pub async fn update_endpoint_response(
    Path(endpoint_id): Path<String>,
    State((pool, _ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
    Json(config): Json<UpdateResponseConfig>,
) -> Result<StatusCode, (StatusCode, String)> {
    // Validate status code (100-599)
    if !(100..=599).contains(&config.status) {
        return Err((
            StatusCode::BAD_REQUEST,
            "Status code must be between 100 and 599".to_string(),
        ));
    }

    // Validate headers JSON if provided
    if let Some(ref headers) = config.headers {
        if serde_json::from_str::<serde_json::Value>(headers).is_err() {
            return Err((
                StatusCode::BAD_REQUEST,
                "Headers must be valid JSON".to_string(),
            ));
        }
    }

    // Update endpoint response configuration
    let updated = crate::services::endpoint::update_response_config(
        &pool,
        &endpoint_id,
        config.enabled,
        config.status,
        config.headers,
        config.body,
    )
    .await
    .map_err(|e| {
        tracing::error!("Database error updating endpoint response: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error".to_string())
    })?;

    if !updated {
        return Err((StatusCode::NOT_FOUND, "Endpoint not found".to_string()));
    }

    tracing::info!(
        "Updated response config for endpoint {}: enabled={}, status={}",
        endpoint_id,
        config.enabled,
        config.status
    );

    Ok(StatusCode::NO_CONTENT)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db;
    use axum::extract::Query;

    async fn setup_test_db() -> SqlitePool {
        db::init_pool("sqlite::memory:").await.unwrap()
    }

    fn create_test_state(pool: SqlitePool) -> (SqlitePool, Arc<WebSocketManager>) {
        (pool, Arc::new(WebSocketManager::new()))
    }

    async fn create_test_endpoint(pool: &SqlitePool) -> String {
        let endpoint_id = uuid::Uuid::new_v4().to_string();
        sqlx::query("INSERT INTO endpoints (id) VALUES (?)")
            .bind(&endpoint_id)
            .execute(pool)
            .await
            .unwrap();
        endpoint_id
    }

    async fn create_test_request(pool: &SqlitePool, endpoint_id: &str, method: &str) -> i64 {
        let result = sqlx::query(
            "INSERT INTO requests (endpoint_id, method, path, headers)
             VALUES (?, ?, ?, ?)",
        )
        .bind(endpoint_id)
        .bind(method)
        .bind("/test")
        .bind("{}")
        .execute(pool)
        .await
        .unwrap();

        result.last_insert_rowid()
    }

    #[tokio::test]
    async fn test_get_endpoint_requests_empty() {
        let pool = setup_test_db().await;
        let endpoint_id = create_test_endpoint(&pool).await;

        let params = RequestQueryParams {
            page: 1,
            limit: 50,
            method: None,
        };

        let result = get_endpoint_requests(
            Path(endpoint_id),
            Query(params),
            State(create_test_state(pool)),
        )
        .await;

        assert!(result.is_ok());
        let response = result.unwrap().0;
        assert_eq!(response.requests.len(), 0);
        assert_eq!(response.total, 0);
    }

    #[tokio::test]
    async fn test_get_endpoint_requests_with_data() {
        let pool = setup_test_db().await;
        let endpoint_id = create_test_endpoint(&pool).await;

        // Create 5 test requests
        for _ in 0..5 {
            create_test_request(&pool, &endpoint_id, "POST").await;
        }

        let params = RequestQueryParams {
            page: 1,
            limit: 50,
            method: None,
        };

        let result = get_endpoint_requests(
            Path(endpoint_id),
            Query(params),
            State(create_test_state(pool)),
        )
        .await;

        assert!(result.is_ok());
        let response = result.unwrap().0;
        assert_eq!(response.requests.len(), 5);
        assert_eq!(response.total, 5);
    }

    #[tokio::test]
    async fn test_get_endpoint_requests_pagination() {
        let pool = setup_test_db().await;
        let endpoint_id = create_test_endpoint(&pool).await;

        // Create 25 test requests
        for _ in 0..25 {
            create_test_request(&pool, &endpoint_id, "POST").await;
        }

        // Get page 1 with limit 10
        let params = RequestQueryParams {
            page: 1,
            limit: 10,
            method: None,
        };

        let result = get_endpoint_requests(
            Path(endpoint_id.clone()),
            Query(params),
            State(create_test_state(pool.clone())),
        )
        .await;

        assert!(result.is_ok());
        let response = result.unwrap().0;
        assert_eq!(response.requests.len(), 10);
        assert_eq!(response.total, 25);
        assert_eq!(response.page, 1);

        // Get page 2
        let params = RequestQueryParams {
            page: 2,
            limit: 10,
            method: None,
        };

        let result = get_endpoint_requests(
            Path(endpoint_id),
            Query(params),
            State(create_test_state(pool)),
        )
        .await;

        assert!(result.is_ok());
        let response = result.unwrap().0;
        assert_eq!(response.requests.len(), 10);
        assert_eq!(response.total, 25);
        assert_eq!(response.page, 2);
    }

    #[tokio::test]
    async fn test_get_endpoint_requests_method_filter() {
        let pool = setup_test_db().await;
        let endpoint_id = create_test_endpoint(&pool).await;

        // Create mixed method requests
        for _ in 0..5 {
            create_test_request(&pool, &endpoint_id, "POST").await;
        }
        for _ in 0..3 {
            create_test_request(&pool, &endpoint_id, "GET").await;
        }
        for _ in 0..2 {
            create_test_request(&pool, &endpoint_id, "PUT").await;
        }

        // Filter by POST only
        let params = RequestQueryParams {
            page: 1,
            limit: 50,
            method: Some("POST".to_string()),
        };

        let result = get_endpoint_requests(
            Path(endpoint_id.clone()),
            Query(params),
            State(create_test_state(pool.clone())),
        )
        .await;

        assert!(result.is_ok());
        let response = result.unwrap().0;
        assert_eq!(response.requests.len(), 5);
        assert_eq!(response.total, 5);
        assert!(response.requests.iter().all(|r| r.method == "POST"));

        // Filter by POST,PUT
        let params = RequestQueryParams {
            page: 1,
            limit: 50,
            method: Some("POST,PUT".to_string()),
        };

        let result = get_endpoint_requests(
            Path(endpoint_id),
            Query(params),
            State(create_test_state(pool)),
        )
        .await;

        assert!(result.is_ok());
        let response = result.unwrap().0;
        assert_eq!(response.requests.len(), 7);
        assert_eq!(response.total, 7);
    }

    #[tokio::test]
    async fn test_get_request_by_id() {
        let pool = setup_test_db().await;
        let endpoint_id = create_test_endpoint(&pool).await;
        let request_id = create_test_request(&pool, &endpoint_id, "POST").await;

        let result = get_request_by_id(Path(request_id), State(create_test_state(pool))).await;

        assert!(result.is_ok());
        let response = result.unwrap().0;
        assert_eq!(response.id, request_id);
        assert_eq!(response.method, "POST");
    }

    #[tokio::test]
    async fn test_get_request_by_id_not_found() {
        let pool = setup_test_db().await;

        let result = get_request_by_id(Path(99999), State(create_test_state(pool))).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_delete_endpoint() {
        let pool = setup_test_db().await;
        let endpoint_id = create_test_endpoint(&pool).await;

        // Create some requests
        for _ in 0..5 {
            create_test_request(&pool, &endpoint_id, "POST").await;
        }

        // Delete endpoint
        let result = delete_endpoint(Path(endpoint_id.clone()), State(create_test_state(pool.clone()))).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), StatusCode::NO_CONTENT);

        // Verify endpoint is deleted
        let endpoint_exists: Option<(i64,)> =
            sqlx::query_as("SELECT 1 FROM endpoints WHERE id = ?")
                .bind(&endpoint_id)
                .fetch_optional(&pool)
                .await
                .unwrap();
        assert!(endpoint_exists.is_none());

        // Verify requests are deleted (cascade)
        let request_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM requests WHERE endpoint_id = ?")
            .bind(&endpoint_id)
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(request_count, 0);
    }

    #[tokio::test]
    async fn test_delete_endpoint_not_found() {
        let pool = setup_test_db().await;

        let result = delete_endpoint(Path("nonexistent".to_string()), State(create_test_state(pool))).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_update_endpoint_response() {
        let pool = setup_test_db().await;
        let endpoint_id = create_test_endpoint(&pool).await;

        let config = UpdateResponseConfig {
            enabled: true,
            status: 404,
            headers: Some(r#"{"x-custom":"header"}"#.to_string()),
            body: Some(r#"{"error":"Custom error"}"#.to_string()),
        };

        let result = update_endpoint_response(
            Path(endpoint_id.clone()),
            State(create_test_state(pool.clone())),
            Json(config),
        )
        .await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), StatusCode::NO_CONTENT);

        // Verify the update
        let endpoint: crate::models::Endpoint = sqlx::query_as(
            "SELECT id, created_at, custom_response_enabled, response_status, response_headers, response_body, request_count FROM endpoints WHERE id = ?"
        )
        .bind(&endpoint_id)
        .fetch_one(&pool)
        .await
        .unwrap();

        assert!(endpoint.custom_response_enabled);
        assert_eq!(endpoint.response_status, 404);
        assert_eq!(endpoint.response_headers, Some(r#"{"x-custom":"header"}"#.to_string()));
        assert_eq!(endpoint.response_body, Some(r#"{"error":"Custom error"}"#.to_string()));
    }

    #[tokio::test]
    async fn test_update_endpoint_response_invalid_status() {
        let pool = setup_test_db().await;
        let endpoint_id = create_test_endpoint(&pool).await;

        // Test status code too low
        let config = UpdateResponseConfig {
            enabled: true,
            status: 99,
            headers: None,
            body: None,
        };

        let result = update_endpoint_response(
            Path(endpoint_id.clone()),
            State(create_test_state(pool.clone())),
            Json(config),
        )
        .await;

        assert!(result.is_err());
        let (status, msg) = result.unwrap_err();
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert!(msg.contains("100 and 599"));

        // Test status code too high
        let config = UpdateResponseConfig {
            enabled: true,
            status: 600,
            headers: None,
            body: None,
        };

        let result = update_endpoint_response(
            Path(endpoint_id),
            State(create_test_state(pool)),
            Json(config),
        )
        .await;

        assert!(result.is_err());
        let (status, msg) = result.unwrap_err();
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert!(msg.contains("100 and 599"));
    }

    #[tokio::test]
    async fn test_update_endpoint_response_invalid_json_headers() {
        let pool = setup_test_db().await;
        let endpoint_id = create_test_endpoint(&pool).await;

        let config = UpdateResponseConfig {
            enabled: true,
            status: 200,
            headers: Some("not valid json".to_string()),
            body: None,
        };

        let result = update_endpoint_response(
            Path(endpoint_id),
            State(create_test_state(pool)),
            Json(config),
        )
        .await;

        assert!(result.is_err());
        let (status, msg) = result.unwrap_err();
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert!(msg.contains("valid JSON"));
    }

    #[tokio::test]
    async fn test_update_endpoint_response_not_found() {
        let pool = setup_test_db().await;

        let config = UpdateResponseConfig {
            enabled: true,
            status: 200,
            headers: None,
            body: None,
        };

        let result = update_endpoint_response(
            Path("nonexistent-id".to_string()),
            State(create_test_state(pool)),
            Json(config),
        )
        .await;

        assert!(result.is_err());
        let (status, _) = result.unwrap_err();
        assert_eq!(status, StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_update_endpoint_response_disable() {
        let pool = setup_test_db().await;
        let endpoint_id = create_test_endpoint(&pool).await;

        // First enable with config
        let config = UpdateResponseConfig {
            enabled: true,
            status: 500,
            headers: Some(r#"{"x-error":"true"}"#.to_string()),
            body: Some("Error".to_string()),
        };

        update_endpoint_response(
            Path(endpoint_id.clone()),
            State(create_test_state(pool.clone())),
            Json(config),
        )
        .await
        .unwrap();

        // Now disable
        let config = UpdateResponseConfig {
            enabled: false,
            status: 200,
            headers: None,
            body: None,
        };

        let result = update_endpoint_response(
            Path(endpoint_id.clone()),
            State(create_test_state(pool.clone())),
            Json(config),
        )
        .await;

        assert!(result.is_ok());

        // Verify disabled
        let endpoint: crate::models::Endpoint = sqlx::query_as(
            "SELECT id, created_at, custom_response_enabled, response_status, response_headers, response_body, request_count FROM endpoints WHERE id = ?"
        )
        .bind(&endpoint_id)
        .fetch_one(&pool)
        .await
        .unwrap();

        assert!(!endpoint.custom_response_enabled);
        assert_eq!(endpoint.response_status, 200);
    }
}
