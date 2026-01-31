use axum::{
    extract::{Path, Query, State},
    Json,
};
use hookshot::{
    db,
    handlers::api,
    handlers::endpoint,
    models::{RequestQueryParams, UpdateResponseConfig},
    websocket::WebSocketManager,
};
use sqlx::SqlitePool;
use std::sync::Arc;

type AppState = (SqlitePool, Arc<WebSocketManager>);

async fn setup() -> AppState {
    let pool = db::init_pool("sqlite::memory:").await.unwrap();
    let ws_manager = Arc::new(WebSocketManager::new());
    (pool, ws_manager)
}

async fn create_endpoint(state: &AppState) -> String {
    let response = endpoint::create_endpoint(State(state.clone()))
        .await
        .unwrap();
    response.0.id
}

async fn create_request(pool: &SqlitePool, endpoint_id: &str, method: &str) -> i64 {
    let result = sqlx::query(
        "INSERT INTO requests (endpoint_id, method, path, headers) VALUES (?, ?, ?, ?)",
    )
    .bind(endpoint_id)
    .bind(method)
    .bind("/test")
    .bind(r#"{"content-type":"application/json"}"#)
    .execute(pool)
    .await
    .unwrap();

    result.last_insert_rowid()
}

#[tokio::test]
async fn test_create_endpoint() {
    let state = setup().await;
    let result = endpoint::create_endpoint(State(state)).await;
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert!(uuid::Uuid::parse_str(&response.id).is_ok());
}

#[tokio::test]
async fn test_list_endpoints() {
    let state = setup().await;

    // Initially empty
    let result = endpoint::list_endpoints(State(state.clone())).await;
    assert_eq!(result.unwrap().0.len(), 0);

    // Create 3 endpoints
    for _ in 0..3 {
        create_endpoint(&state).await;
    }

    // List should return 3
    let result = endpoint::list_endpoints(State(state)).await;
    assert_eq!(result.unwrap().0.len(), 3);
}

#[tokio::test]
async fn test_get_endpoint_requests_pagination() {
    let state = setup().await;
    let endpoint_id = create_endpoint(&state).await;

    // Create 75 requests
    for _ in 0..75 {
        create_request(&state.0, &endpoint_id, "POST").await;
    }

    // Page 1
    let params = RequestQueryParams {
        page: 1,
        limit: 50,
        method: None,
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id.clone()),
        Query(params),
        State(state.clone()),
    )
    .await
    .unwrap()
    .0;

    assert_eq!(result.requests.len(), 50);
    assert_eq!(result.total, 75);
    assert_eq!(result.page, 1);

    // Page 2
    let params = RequestQueryParams {
        page: 2,
        limit: 50,
        method: None,
    };
    let result = api::get_endpoint_requests(Path(endpoint_id), Query(params), State(state))
        .await
        .unwrap()
        .0;

    assert_eq!(result.requests.len(), 25);
    assert_eq!(result.page, 2);
}

#[tokio::test]
async fn test_get_endpoint_requests_method_filter() {
    let state = setup().await;
    let endpoint_id = create_endpoint(&state).await;

    // Create mixed requests
    for _ in 0..10 {
        create_request(&state.0, &endpoint_id, "POST").await;
    }
    for _ in 0..5 {
        create_request(&state.0, &endpoint_id, "GET").await;
    }

    // Filter by POST
    let params = RequestQueryParams {
        page: 1,
        limit: 50,
        method: Some("POST".to_string()),
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id.clone()),
        Query(params),
        State(state.clone()),
    )
    .await
    .unwrap()
    .0;

    assert_eq!(result.requests.len(), 10);
    assert!(result.requests.iter().all(|r| r.method == "POST"));

    // Filter by multiple methods
    let params = RequestQueryParams {
        page: 1,
        limit: 50,
        method: Some("POST,GET".to_string()),
    };
    let result = api::get_endpoint_requests(Path(endpoint_id), Query(params), State(state))
        .await
        .unwrap()
        .0;

    assert_eq!(result.requests.len(), 15);
}

#[tokio::test]
async fn test_get_request_by_id() {
    let state = setup().await;
    let endpoint_id = create_endpoint(&state).await;
    let request_id = create_request(&state.0, &endpoint_id, "POST").await;

    let result = api::get_request_by_id(Path(request_id), State(state))
        .await
        .unwrap()
        .0;

    assert_eq!(result.id, request_id);
    assert_eq!(result.method, "POST");
}

#[tokio::test]
async fn test_get_request_by_id_not_found() {
    let state = setup().await;
    let result = api::get_request_by_id(Path(99999), State(state)).await;
    assert_eq!(result.unwrap_err(), axum::http::StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_delete_endpoint() {
    let state = setup().await;
    let endpoint_id = create_endpoint(&state).await;

    // Create requests
    for _ in 0..5 {
        create_request(&state.0, &endpoint_id, "POST").await;
    }

    // Delete endpoint
    let result = api::delete_endpoint(Path(endpoint_id.clone()), State(state.clone())).await;
    assert_eq!(result.unwrap(), axum::http::StatusCode::NO_CONTENT);

    // Verify cascade delete
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM requests WHERE endpoint_id = ?")
        .bind(&endpoint_id)
        .fetch_one(&state.0)
        .await
        .unwrap();
    assert_eq!(count, 0);
}

#[tokio::test]
async fn test_delete_endpoint_not_found() {
    let state = setup().await;
    let result = api::delete_endpoint(Path("nonexistent".to_string()), State(state)).await;
    assert_eq!(result.unwrap_err(), axum::http::StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_update_endpoint_response() {
    let state = setup().await;
    let endpoint_id = create_endpoint(&state).await;

    let config = UpdateResponseConfig {
        enabled: true,
        status: 404,
        headers: Some(r#"{"x-custom":"value"}"#.to_string()),
        body: Some(r#"{"error":"Not found"}"#.to_string()),
    };

    let result = api::update_endpoint_response(
        Path(endpoint_id.clone()),
        State(state.clone()),
        Json(config),
    )
    .await;

    // Verify the response contains the updated endpoint
    assert!(result.is_ok());
    let Json(endpoint) = result.unwrap();

    assert_eq!(endpoint.id, endpoint_id);
    assert!(endpoint.custom_response_enabled);
    assert_eq!(endpoint.response_status, 404);
    assert_eq!(
        endpoint.response_headers,
        Some(r#"{"x-custom":"value"}"#.to_string())
    );
}

#[tokio::test]
async fn test_update_endpoint_response_invalid_status() {
    let state = setup().await;
    let endpoint_id = create_endpoint(&state).await;

    // Test invalid status codes
    for status in [99, 600, 0, 1000] {
        let config = UpdateResponseConfig {
            enabled: true,
            status,
            headers: None,
            body: None,
        };
        let result = api::update_endpoint_response(
            Path(endpoint_id.clone()),
            State(state.clone()),
            Json(config),
        )
        .await;
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().0, axum::http::StatusCode::BAD_REQUEST);
    }

    // Test valid status codes
    for status in [100, 200, 404, 500, 599] {
        let config = UpdateResponseConfig {
            enabled: true,
            status,
            headers: None,
            body: None,
        };
        let result = api::update_endpoint_response(
            Path(endpoint_id.clone()),
            State(state.clone()),
            Json(config),
        )
        .await;
        assert!(result.is_ok());
    }
}

#[tokio::test]
async fn test_update_endpoint_response_invalid_json() {
    let state = setup().await;
    let endpoint_id = create_endpoint(&state).await;

    let config = UpdateResponseConfig {
        enabled: true,
        status: 200,
        headers: Some("not valid json".to_string()),
        body: None,
    };

    let result = api::update_endpoint_response(Path(endpoint_id), State(state), Json(config)).await;
    assert!(result.is_err());
    let (status, msg) = result.unwrap_err();
    assert_eq!(status, axum::http::StatusCode::BAD_REQUEST);
    assert!(msg.contains("valid JSON"));
}

#[tokio::test]
async fn test_update_endpoint_response_not_found() {
    let state = setup().await;
    let config = UpdateResponseConfig {
        enabled: true,
        status: 200,
        headers: None,
        body: None,
    };
    let result =
        api::update_endpoint_response(Path("nonexistent".to_string()), State(state), Json(config))
            .await;
    assert_eq!(result.unwrap_err().0, axum::http::StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_pagination_limits() {
    let state = setup().await;
    let endpoint_id = create_endpoint(&state).await;

    for _ in 0..10 {
        create_request(&state.0, &endpoint_id, "POST").await;
    }

    // Test limit > 100 should be capped
    let params = RequestQueryParams {
        page: 1,
        limit: 200,
        method: None,
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id.clone()),
        Query(params),
        State(state.clone()),
    )
    .await
    .unwrap()
    .0;
    assert_eq!(result.limit, 100);

    // Test page 0 should default to 1
    let params = RequestQueryParams {
        page: 0,
        limit: 50,
        method: None,
    };
    let result = api::get_endpoint_requests(Path(endpoint_id), Query(params), State(state))
        .await
        .unwrap()
        .0;
    assert_eq!(result.page, 1);
}

#[tokio::test]
async fn test_json_response_format() {
    let state = setup().await;
    let endpoint_id = create_endpoint(&state).await;
    create_request(&state.0, &endpoint_id, "POST").await;

    // Test list response
    let list_result = endpoint::list_endpoints(State(state.clone()))
        .await
        .unwrap()
        .0;
    let list_json = serde_json::to_value(&list_result).unwrap();
    assert!(list_json.is_array());

    // Test request list response
    let params = RequestQueryParams {
        page: 1,
        limit: 50,
        method: None,
    };
    let requests_result =
        api::get_endpoint_requests(Path(endpoint_id), Query(params), State(state))
            .await
            .unwrap()
            .0;
    let requests_json = serde_json::to_value(&requests_result).unwrap();
    assert!(requests_json.get("requests").unwrap().is_array());
    assert!(requests_json.get("total").is_some());
    assert!(requests_json.get("page").is_some());
    assert!(requests_json.get("limit").is_some());
}
