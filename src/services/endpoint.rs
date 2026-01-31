use crate::models::{CreateEndpointResponse, Endpoint};
use sqlx::SqlitePool;
use uuid::Uuid;

/// Create a new endpoint with a generated UUID
pub async fn create_endpoint(pool: &SqlitePool) -> Result<CreateEndpointResponse, sqlx::Error> {
    let id = Uuid::new_v4().to_string();

    sqlx::query(
        r#"
        INSERT INTO endpoints (id, custom_response_enabled, response_status, request_count)
        VALUES (?, FALSE, 200, 0)
        "#,
    )
    .bind(&id)
    .execute(pool)
    .await?;

    tracing::info!("Created new endpoint: {}", id);

    Ok(CreateEndpointResponse { id })
}

/// List all endpoints with full configuration
pub async fn list_endpoints(pool: &SqlitePool) -> Result<Vec<Endpoint>, sqlx::Error> {
    let endpoints = sqlx::query_as::<_, Endpoint>(
        r#"
        SELECT id, created_at, custom_response_enabled, response_status,
               response_headers, response_body, request_count
        FROM endpoints
        ORDER BY created_at DESC
        "#,
    )
    .fetch_all(pool)
    .await?;

    Ok(endpoints)
}

/// Get a single endpoint by ID
pub async fn get_endpoint(pool: &SqlitePool, id: &str) -> Result<Option<Endpoint>, sqlx::Error> {
    let endpoint = sqlx::query_as::<_, Endpoint>(
        r#"
        SELECT id, created_at, custom_response_enabled, response_status,
               response_headers, response_body, request_count
        FROM endpoints
        WHERE id = ?
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(endpoint)
}

/// Update custom response configuration for an endpoint
pub async fn update_response_config(
    pool: &SqlitePool,
    id: &str,
    enabled: bool,
    status: i32,
    headers: Option<String>,
    body: Option<String>,
) -> Result<bool, sqlx::Error> {
    let result = sqlx::query(
        r#"
        UPDATE endpoints
        SET custom_response_enabled = ?,
            response_status = ?,
            response_headers = ?,
            response_body = ?
        WHERE id = ?
        "#,
    )
    .bind(enabled)
    .bind(status)
    .bind(&headers)
    .bind(&body)
    .bind(id)
    .execute(pool)
    .await?;

    Ok(result.rows_affected() > 0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::init_pool;

    #[tokio::test]
    async fn test_create_endpoint() {
        let pool = init_pool("sqlite::memory:").await.unwrap();
        let result = create_endpoint(&pool).await;
        assert!(result.is_ok(), "Creating endpoint should succeed");

        let response = result.unwrap();
        assert!(!response.id.is_empty(), "Generated ID should not be empty");
    }

    #[tokio::test]
    async fn test_list_endpoints() {
        let pool = init_pool("sqlite::memory:").await.unwrap();

        // Initially empty
        let endpoints = list_endpoints(&pool).await.unwrap();
        assert_eq!(endpoints.len(), 0, "Should start with no endpoints");

        // Create one endpoint
        create_endpoint(&pool).await.unwrap();
        let endpoints = list_endpoints(&pool).await.unwrap();
        assert_eq!(endpoints.len(), 1, "Should have one endpoint");
    }

    #[tokio::test]
    async fn test_get_endpoint() {
        let pool = init_pool("sqlite::memory:").await.unwrap();

        // Create an endpoint
        let created = create_endpoint(&pool).await.unwrap();

        // Retrieve it
        let endpoint = get_endpoint(&pool, &created.id).await.unwrap();
        assert!(endpoint.is_some(), "Endpoint should exist");

        let endpoint = endpoint.unwrap();
        assert_eq!(endpoint.id, created.id);
        assert_eq!(endpoint.request_count, 0);
    }

    #[tokio::test]
    async fn test_uuid_uniqueness() {
        let pool = init_pool("sqlite::memory:").await.unwrap();

        let endpoint1 = create_endpoint(&pool).await.unwrap();
        let endpoint2 = create_endpoint(&pool).await.unwrap();

        assert_ne!(endpoint1.id, endpoint2.id, "UUIDs should be unique");
    }

    #[tokio::test]
    async fn test_update_response_config() {
        let pool = init_pool("sqlite::memory:").await.unwrap();
        let created = create_endpoint(&pool).await.unwrap();

        // Update response config
        let updated = update_response_config(
            &pool,
            &created.id,
            true,
            404,
            Some(r#"{"x-custom":"value"}"#.to_string()),
            Some(r#"{"error":"not found"}"#.to_string()),
        )
        .await
        .unwrap();

        assert!(updated, "Update should succeed");

        // Verify update
        let endpoint = get_endpoint(&pool, &created.id).await.unwrap().unwrap();
        assert!(endpoint.custom_response_enabled);
        assert_eq!(endpoint.response_status, 404);
        assert_eq!(
            endpoint.response_headers,
            Some(r#"{"x-custom":"value"}"#.to_string())
        );
        assert_eq!(
            endpoint.response_body,
            Some(r#"{"error":"not found"}"#.to_string())
        );
    }

    #[tokio::test]
    async fn test_update_response_config_nonexistent() {
        let pool = init_pool("sqlite::memory:").await.unwrap();

        let updated = update_response_config(&pool, "nonexistent-id", true, 404, None, None)
            .await
            .unwrap();

        assert!(
            !updated,
            "Update should return false for nonexistent endpoint"
        );
    }
}
