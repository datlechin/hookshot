use axum::{
    body::Body,
    extract::connect_info::MockConnectInfo,
    http::{Method, Request, StatusCode},
};
use hookshot::{db, handlers};
use sqlx::SqlitePool;
use tower::util::ServiceExt;

/// Helper to create test database pool
async fn create_test_pool() -> SqlitePool {
    let pool = db::init_pool("sqlite::memory:")
        .await
        .expect("Failed to create test pool");
    pool
}

/// Helper to create a test endpoint
async fn create_test_endpoint(pool: &SqlitePool) -> String {
    let endpoint_id = uuid::Uuid::new_v4().to_string();
    sqlx::query(
        r#"
        INSERT INTO endpoints (id, created_at, custom_response_enabled, response_status, request_count)
        VALUES (?, datetime('now'), false, 200, 0)
        "#
    )
    .bind(&endpoint_id)
    .execute(pool)
    .await
    .expect("Failed to create test endpoint");
    
    endpoint_id
}

#[tokio::test]
async fn test_webhook_post_request() {
    let pool = create_test_pool().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    // Create webhook handler with mock ConnectInfo
    let app = axum::Router::new()
        .route("/webhook/:id", axum::routing::any(handlers::webhook::webhook_handler))
        .with_state(pool.clone())
        .layer(MockConnectInfo(std::net::SocketAddr::from(([127, 0, 0, 1], 8080))));

    // Send POST request
    let request = Request::builder()
        .method(Method::POST)
        .uri(format!("/webhook/{}", endpoint_id))
        .header("content-type", "application/json")
        .header("user-agent", "test-client")
        .body(Body::from(r#"{"test": "data"}"#))
        .unwrap();

    let response = app
        .oneshot(request)
        .await
        .expect("Failed to execute request");

    // Check response
    assert_eq!(response.status(), StatusCode::OK);

    // Wait for async database insertion
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Verify request was captured
    let captured: (i64, String, String, String) = sqlx::query_as(
        "SELECT id, method, path, headers FROM requests WHERE endpoint_id = ?"
    )
    .bind(&endpoint_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to fetch captured request");

    assert_eq!(captured.1, "POST");
    assert_eq!(captured.2, format!("/webhook/{}", endpoint_id));
    assert!(captured.3.contains("application/json"));

    // Verify request count incremented
    let count: i32 = sqlx::query_scalar("SELECT request_count FROM endpoints WHERE id = ?")
        .bind(&endpoint_id)
        .fetch_one(&pool)
        .await
        .expect("Failed to fetch endpoint");

    assert_eq!(count, 1);
}

#[tokio::test]
async fn test_webhook_get_request() {
    let pool = create_test_pool().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    let app = axum::Router::new()
        .route("/webhook/:id", axum::routing::any(handlers::webhook::webhook_handler))
        .with_state(pool.clone())
        .layer(MockConnectInfo(std::net::SocketAddr::from(([127, 0, 0, 1], 8080))));

    // Send GET request with query parameters
    let request = Request::builder()
        .method(Method::GET)
        .uri(format!("/webhook/{}?key=value&foo=bar", endpoint_id))
        .body(Body::empty())
        .unwrap();

    let response = app
        .oneshot(request)
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), StatusCode::OK);

    // Wait for async database insertion
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Verify query string was captured
    let query_string: Option<String> = sqlx::query_scalar(
        "SELECT query_string FROM requests WHERE endpoint_id = ?"
    )
    .bind(&endpoint_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to fetch captured request");

    assert_eq!(query_string, Some("key=value&foo=bar".to_string()));
}

#[tokio::test]
async fn test_webhook_invalid_endpoint() {
    let pool = create_test_pool().await;
    let invalid_id = uuid::Uuid::new_v4().to_string();

    let app = axum::Router::new()
        .route("/webhook/:id", axum::routing::any(handlers::webhook::webhook_handler))
        .with_state(pool.clone())
        .layer(MockConnectInfo(std::net::SocketAddr::from(([127, 0, 0, 1], 8080))));

    let request = Request::builder()
        .method(Method::POST)
        .uri(format!("/webhook/{}", invalid_id))
        .body(Body::empty())
        .unwrap();

    let response = app
        .oneshot(request)
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_webhook_payload_too_large() {
    let pool = create_test_pool().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    let app = axum::Router::new()
        .route("/webhook/:id", axum::routing::any(handlers::webhook::webhook_handler))
        .with_state(pool.clone())
        .layer(MockConnectInfo(std::net::SocketAddr::from(([127, 0, 0, 1], 8080))));

    // Create 11MB payload
    let large_payload = "x".repeat(11 * 1024 * 1024);
    
    let request = Request::builder()
        .method(Method::POST)
        .uri(format!("/webhook/{}", endpoint_id))
        .body(Body::from(large_payload))
        .unwrap();

    let response = app
        .oneshot(request)
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), StatusCode::PAYLOAD_TOO_LARGE);
}

#[tokio::test]
async fn test_webhook_all_http_methods() {
    let pool = create_test_pool().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    let methods = vec![
        Method::GET,
        Method::POST,
        Method::PUT,
        Method::PATCH,
        Method::DELETE,
    ];

    for method in methods {
        let app = axum::Router::new()
            .route("/webhook/:id", axum::routing::any(handlers::webhook::webhook_handler))
            .with_state(pool.clone())
            .layer(MockConnectInfo(std::net::SocketAddr::from(([127, 0, 0, 1], 8080))));

        let request = Request::builder()
            .method(method.clone())
            .uri(format!("/webhook/{}", endpoint_id))
            .body(Body::empty())
            .unwrap();

        let response = app
            .oneshot(request)
            .await
            .expect("Failed to execute request");

        assert_eq!(
            response.status(),
            StatusCode::OK,
            "Method {} should return 200 OK",
            method
        );
    }

    // Wait for async database insertions
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    // Verify all requests were captured
    let count: i32 = sqlx::query_scalar("SELECT COUNT(*) FROM requests WHERE endpoint_id = ?")
        .bind(&endpoint_id)
        .fetch_one(&pool)
        .await
        .expect("Failed to count requests");

    assert_eq!(count, 5);
}

#[tokio::test]
async fn test_webhook_binary_body() {
    let pool = create_test_pool().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    let app = axum::Router::new()
        .route("/webhook/:id", axum::routing::any(handlers::webhook::webhook_handler))
        .with_state(pool.clone())
        .layer(MockConnectInfo(std::net::SocketAddr::from(([127, 0, 0, 1], 8080))));

    // Send binary data
    let binary_data = vec![0u8, 1, 2, 3, 255, 254, 253];
    
    let request = Request::builder()
        .method(Method::POST)
        .uri(format!("/webhook/{}", endpoint_id))
        .header("content-type", "application/octet-stream")
        .body(Body::from(binary_data.clone()))
        .unwrap();

    let response = app
        .oneshot(request)
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), StatusCode::OK);

    // Wait for async database insertion
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Verify binary body was stored correctly
    let stored_body: Option<Vec<u8>> = sqlx::query_scalar(
        "SELECT body FROM requests WHERE endpoint_id = ?"
    )
    .bind(&endpoint_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to fetch captured request");

    assert_eq!(stored_body, Some(binary_data));
}

#[tokio::test]
async fn test_webhook_empty_body() {
    let pool = create_test_pool().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    let app = axum::Router::new()
        .route("/webhook/:id", axum::routing::any(handlers::webhook::webhook_handler))
        .with_state(pool.clone())
        .layer(MockConnectInfo(std::net::SocketAddr::from(([127, 0, 0, 1], 8080))));

    let request = Request::builder()
        .method(Method::POST)
        .uri(format!("/webhook/{}", endpoint_id))
        .body(Body::empty())
        .unwrap();

    let response = app
        .oneshot(request)
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), StatusCode::OK);

    // Wait for async database insertion
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Verify empty body is stored as NULL
    let stored_body: Option<Vec<u8>> = sqlx::query_scalar(
        "SELECT body FROM requests WHERE endpoint_id = ?"
    )
    .bind(&endpoint_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to fetch captured request");

    assert_eq!(stored_body, None);
}

#[tokio::test]
async fn test_webhook_cors_headers() {
    let pool = create_test_pool().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    let app = axum::Router::new()
        .route("/webhook/:id", axum::routing::any(handlers::webhook::webhook_handler))
        .with_state(pool.clone())
        .layer(MockConnectInfo(std::net::SocketAddr::from(([127, 0, 0, 1], 8080))));

    let request = Request::builder()
        .method(Method::POST)
        .uri(format!("/webhook/{}", endpoint_id))
        .body(Body::empty())
        .unwrap();

    let response = app
        .oneshot(request)
        .await
        .expect("Failed to execute request");

    // Verify CORS header is present
    let cors_header = response
        .headers()
        .get("access-control-allow-origin")
        .expect("CORS header should be present");

    assert_eq!(cors_header, "*");
}
