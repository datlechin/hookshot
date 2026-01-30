use sqlx::SqlitePool;

/// Request data for storing in database
pub struct StoreRequestData {
    pub endpoint_id: String,
    pub method: String,
    pub path: String,
    pub query_string: Option<String>,
    pub headers: String,
    pub body: Option<Vec<u8>>,
    pub content_type: Option<String>,
    pub received_at: String,
    pub ip_address: String,
}

/// Store a captured request in the database
#[allow(dead_code)]
pub async fn store_request(
    pool: &SqlitePool,
    data: StoreRequestData,
) -> Result<i64, sqlx::Error> {
    let result = sqlx::query(
        r#"
        INSERT INTO requests (endpoint_id, method, path, query_string, headers, body, content_type, received_at, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&data.endpoint_id)
    .bind(&data.method)
    .bind(&data.path)
    .bind(&data.query_string)
    .bind(&data.headers)
    .bind(&data.body)
    .bind(&data.content_type)
    .bind(&data.received_at)
    .bind(&data.ip_address)
    .execute(pool)
    .await?;

    Ok(result.last_insert_rowid())
}

/// Increment request count for an endpoint
#[allow(dead_code)]
pub async fn increment_request_count(pool: &SqlitePool, endpoint_id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE endpoints SET request_count = request_count + 1 WHERE id = ?")
        .bind(endpoint_id)
        .execute(pool)
        .await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::init_pool;
    use crate::models::Request;

    async fn create_test_endpoint(pool: &SqlitePool, id: &str) {
        sqlx::query(
            "INSERT INTO endpoints (id, custom_response_enabled, response_status, request_count) VALUES (?, false, 200, 0)"
        )
        .bind(id)
        .execute(pool)
        .await
        .unwrap();
    }

    #[tokio::test]
    async fn test_store_request() {
        let pool = init_pool("sqlite::memory:").await.unwrap();
        let endpoint_id = "test-endpoint";
        create_test_endpoint(&pool, endpoint_id).await;

        let headers = r#"{"content-type": "application/json"}"#.to_string();
        let body = Some(b"test body".to_vec());
        let received_at = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true);

        let request_id = store_request(
            &pool,
            StoreRequestData {
                endpoint_id: endpoint_id.to_string(),
                method: "POST".to_string(),
                path: "/webhook/test".to_string(),
                query_string: Some("key=value".to_string()),
                headers: headers.clone(),
                body: body.clone(),
                content_type: Some("application/json".to_string()),
                received_at: received_at.clone(),
                ip_address: "127.0.0.1".to_string(),
            },
        )
        .await
        .unwrap();

        assert!(request_id > 0);

        // Verify request was stored
        let stored: Request = sqlx::query_as(
            "SELECT id, endpoint_id, method, path, query_string, headers, body, content_type, received_at, ip_address FROM requests WHERE id = ?"
        )
        .bind(request_id)
        .fetch_one(&pool)
        .await
        .unwrap();

        assert_eq!(stored.endpoint_id, endpoint_id);
        assert_eq!(stored.method, "POST");
        assert_eq!(stored.path, "/webhook/test");
        assert_eq!(stored.query_string, Some("key=value".to_string()));
        assert_eq!(stored.headers, headers);
        assert_eq!(stored.body, body);
        assert_eq!(stored.content_type, Some("application/json".to_string()));
        assert_eq!(stored.ip_address, Some("127.0.0.1".to_string()));
    }

    #[tokio::test]
    async fn test_increment_request_count() {
        let pool = init_pool("sqlite::memory:").await.unwrap();
        let endpoint_id = "test-endpoint";
        create_test_endpoint(&pool, endpoint_id).await;

        // Initial count should be 0
        let count: i32 = sqlx::query_scalar("SELECT request_count FROM endpoints WHERE id = ?")
            .bind(endpoint_id)
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(count, 0);

        // Increment count
        increment_request_count(&pool, endpoint_id).await.unwrap();

        // Verify count was incremented
        let count: i32 = sqlx::query_scalar("SELECT request_count FROM endpoints WHERE id = ?")
            .bind(endpoint_id)
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(count, 1);

        // Increment again
        increment_request_count(&pool, endpoint_id).await.unwrap();

        let count: i32 = sqlx::query_scalar("SELECT request_count FROM endpoints WHERE id = ?")
            .bind(endpoint_id)
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(count, 2);
    }
}
