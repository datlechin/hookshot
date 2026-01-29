use hookshot::{db, handlers::api, models::RequestQueryParams};
use axum::{
    extract::{Path, Query, State},
};
use sqlx::SqlitePool;
use std::time::Instant;

async fn setup_test_db() -> SqlitePool {
    db::init_pool("sqlite::memory:").await.unwrap()
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

async fn create_test_request(
    pool: &SqlitePool,
    endpoint_id: &str,
    method: &str,
    body: Option<Vec<u8>>,
) -> i64 {
    let headers = r#"{"content-type":"application/json"}"#;
    let result = sqlx::query(
        "INSERT INTO requests (endpoint_id, method, path, headers, body, content_type) 
         VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(endpoint_id)
    .bind(method)
    .bind("/test")
    .bind(headers)
    .bind(body)
    .bind("application/json")
    .execute(pool)
    .await
    .unwrap();

    result.last_insert_rowid()
}

#[tokio::test]
async fn test_pagination_with_150_requests() {
    let pool = setup_test_db().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    // Create 150 test requests
    for i in 0..150 {
        let body = format!(r#"{{"index":{}}}"#, i).into_bytes();
        create_test_request(&pool, &endpoint_id, "POST", Some(body)).await;
    }

    // Test page 1
    let params = RequestQueryParams {
        page: 1,
        limit: 50,
        method: None,
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id.clone()),
        Query(params),
        State(pool.clone()),
    )
    .await;
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.requests.len(), 50);
    assert_eq!(response.total, 150);
    assert_eq!(response.page, 1);

    // Test page 2
    let params = RequestQueryParams {
        page: 2,
        limit: 50,
        method: None,
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id.clone()),
        Query(params),
        State(pool.clone()),
    )
    .await;
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.requests.len(), 50);
    assert_eq!(response.total, 150);
    assert_eq!(response.page, 2);

    // Test page 3
    let params = RequestQueryParams {
        page: 3,
        limit: 50,
        method: None,
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id.clone()),
        Query(params),
        State(pool.clone()),
    )
    .await;
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.requests.len(), 50);
    assert_eq!(response.total, 150);
    assert_eq!(response.page, 3);

    // Test page 4 (should be empty)
    let params = RequestQueryParams {
        page: 4,
        limit: 50,
        method: None,
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id),
        Query(params),
        State(pool),
    )
    .await;
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.requests.len(), 0);
    assert_eq!(response.total, 150);
    assert_eq!(response.page, 4);
}

#[tokio::test]
async fn test_method_filtering_with_mixed_methods() {
    let pool = setup_test_db().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    // Create mixed method requests
    for _ in 0..10 {
        create_test_request(&pool, &endpoint_id, "POST", None).await;
    }
    for _ in 0..5 {
        create_test_request(&pool, &endpoint_id, "GET", None).await;
    }
    for _ in 0..3 {
        create_test_request(&pool, &endpoint_id, "PUT", None).await;
    }
    for _ in 0..2 {
        create_test_request(&pool, &endpoint_id, "DELETE", None).await;
    }

    // Filter by single method
    let params = RequestQueryParams {
        page: 1,
        limit: 50,
        method: Some("POST".to_string()),
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id.clone()),
        Query(params),
        State(pool.clone()),
    )
    .await;
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.requests.len(), 10);
    assert_eq!(response.total, 10);
    assert!(response.requests.iter().all(|r| r.method == "POST"));

    // Filter by multiple methods
    let params = RequestQueryParams {
        page: 1,
        limit: 50,
        method: Some("POST,PUT,DELETE".to_string()),
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id.clone()),
        Query(params),
        State(pool.clone()),
    )
    .await;
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.requests.len(), 15);
    assert_eq!(response.total, 15);

    // Filter by method that doesn't exist
    let params = RequestQueryParams {
        page: 1,
        limit: 50,
        method: Some("PATCH".to_string()),
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id),
        Query(params),
        State(pool),
    )
    .await;
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.requests.len(), 0);
    assert_eq!(response.total, 0);
}

#[tokio::test]
async fn test_binary_body_encoding() {
    let pool = setup_test_db().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    // Create request with binary body
    let binary_body: Vec<u8> = vec![0xFF, 0xFE, 0xFD, 0xFC, 0x00, 0x01, 0x02, 0x03];
    let request_id = create_test_request(&pool, &endpoint_id, "POST", Some(binary_body.clone())).await;

    // Retrieve request
    let result = api::get_request_by_id(Path(request_id), State(pool)).await;
    assert!(result.is_ok());
    let response = result.unwrap().0;

    // Body should be base64 encoded (since it's not valid UTF-8)
    assert!(response.body.is_some());
    let body = response.body.unwrap();
    
    // Decode and verify
    use base64::{engine::general_purpose, Engine as _};
    let decoded = general_purpose::STANDARD.decode(&body).unwrap();
    assert_eq!(decoded, binary_body);
}

#[tokio::test]
async fn test_utf8_body_encoding() {
    let pool = setup_test_db().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    // Create request with UTF-8 body
    let utf8_body = r#"{"message":"Hello, World!"}"#.as_bytes().to_vec();
    let request_id = create_test_request(&pool, &endpoint_id, "POST", Some(utf8_body.clone())).await;

    // Retrieve request
    let result = api::get_request_by_id(Path(request_id), State(pool)).await;
    assert!(result.is_ok());
    let response = result.unwrap().0;

    // Body should be UTF-8 string (not base64)
    assert!(response.body.is_some());
    let body = response.body.unwrap();
    assert_eq!(body, r#"{"message":"Hello, World!"}"#);
}

#[tokio::test]
async fn test_cascade_delete_with_many_requests() {
    let pool = setup_test_db().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    // Create 100 requests
    for _ in 0..100 {
        create_test_request(&pool, &endpoint_id, "POST", None).await;
    }

    // Verify requests exist
    let count_before: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM requests WHERE endpoint_id = ?")
        .bind(&endpoint_id)
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(count_before, 100);

    // Delete endpoint
    let result = api::delete_endpoint(Path(endpoint_id.clone()), State(pool.clone())).await;
    assert!(result.is_ok());

    // Verify all requests are deleted
    let count_after: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM requests WHERE endpoint_id = ?")
        .bind(&endpoint_id)
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(count_after, 0);

    // Verify endpoint is deleted
    let endpoint_exists: Option<(String,)> = sqlx::query_as("SELECT id FROM endpoints WHERE id = ?")
        .bind(&endpoint_id)
        .fetch_optional(&pool)
        .await
        .unwrap();
    assert!(endpoint_exists.is_none());
}

#[tokio::test]
async fn test_performance_query_10k_requests() {
    let pool = setup_test_db().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    println!("Creating 10,000 test requests...");
    let start = Instant::now();
    
    // Create 10,000 requests in batches for faster insertion
    for batch in 0..100 {
        let mut tx = pool.begin().await.unwrap();
        for i in 0..100 {
            let idx = batch * 100 + i;
            let method = match idx % 4 {
                0 => "POST",
                1 => "GET",
                2 => "PUT",
                _ => "DELETE",
            };
            let body = format!(r#"{{"index":{}}}"#, idx).into_bytes();
            sqlx::query(
                "INSERT INTO requests (endpoint_id, method, path, headers, body, content_type) 
                 VALUES (?, ?, ?, ?, ?, ?)",
            )
            .bind(&endpoint_id)
            .bind(method)
            .bind("/test")
            .bind(r#"{"content-type":"application/json"}"#)
            .bind(&body)
            .bind("application/json")
            .execute(&mut *tx)
            .await
            .unwrap();
        }
        tx.commit().await.unwrap();
    }
    
    let insert_duration = start.elapsed();
    println!("Inserted 10,000 requests in {:?}", insert_duration);

    // Test query performance - all requests
    let start = Instant::now();
    let params = RequestQueryParams {
        page: 1,
        limit: 50,
        method: None,
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id.clone()),
        Query(params),
        State(pool.clone()),
    )
    .await;
    let query_duration = start.elapsed();
    
    println!("Query completed in {:?}", query_duration);
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.requests.len(), 50);
    assert_eq!(response.total, 10000);
    
    // Query should complete in < 100ms (requirement from tasks.md)
    assert!(
        query_duration.as_millis() < 100,
        "Query took {:?}, which exceeds 100ms requirement",
        query_duration
    );

    // Test query performance with filter
    let start = Instant::now();
    let params = RequestQueryParams {
        page: 1,
        limit: 50,
        method: Some("POST".to_string()),
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id.clone()),
        Query(params),
        State(pool.clone()),
    )
    .await;
    let filter_query_duration = start.elapsed();
    
    println!("Filtered query completed in {:?}", filter_query_duration);
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.requests.len(), 50);
    assert_eq!(response.total, 2500); // 1/4 of 10,000
    assert!(response.requests.iter().all(|r| r.method == "POST"));
    
    // Filtered query should also complete in < 100ms
    assert!(
        filter_query_duration.as_millis() < 100,
        "Filtered query took {:?}, which exceeds 100ms requirement",
        filter_query_duration
    );

    // Test pagination performance (page 50)
    let start = Instant::now();
    let params = RequestQueryParams {
        page: 50,
        limit: 50,
        method: None,
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id),
        Query(params),
        State(pool),
    )
    .await;
    let pagination_duration = start.elapsed();
    
    println!("Pagination query (page 50) completed in {:?}", pagination_duration);
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.requests.len(), 50);
    
    // Pagination should also be fast
    assert!(
        pagination_duration.as_millis() < 100,
        "Pagination query took {:?}, which exceeds 100ms requirement",
        pagination_duration
    );
}

#[tokio::test]
async fn test_invalid_endpoint_returns_404() {
    let pool = setup_test_db().await;

    let params = RequestQueryParams {
        page: 1,
        limit: 50,
        method: None,
    };
    let result = api::get_endpoint_requests(
        Path("nonexistent-endpoint-id".to_string()),
        Query(params),
        State(pool),
    )
    .await;

    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), axum::http::StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_pagination_limits() {
    let pool = setup_test_db().await;
    let endpoint_id = create_test_endpoint(&pool).await;

    // Create 10 requests
    for _ in 0..10 {
        create_test_request(&pool, &endpoint_id, "POST", None).await;
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
        State(pool.clone()),
    )
    .await;
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.limit, 100); // Should be capped

    // Test page 0 should default to 1
    let params = RequestQueryParams {
        page: 0,
        limit: 50,
        method: None,
    };
    let result = api::get_endpoint_requests(
        Path(endpoint_id),
        Query(params),
        State(pool),
    )
    .await;
    assert!(result.is_ok());
    let response = result.unwrap().0;
    assert_eq!(response.page, 1); // Should default to 1
}
