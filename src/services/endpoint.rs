use crate::models::{CreateEndpointResponse, Endpoint, EndpointSummary};
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

/// List all endpoints with summary information
pub async fn list_endpoints(pool: &SqlitePool) -> Result<Vec<EndpointSummary>, sqlx::Error> {
    let endpoints = sqlx::query_as::<_, EndpointSummary>(
        r#"
        SELECT id, created_at, request_count
        FROM endpoints
        ORDER BY created_at DESC
        "#,
    )
    .fetch_all(pool)
    .await?;

    Ok(endpoints)
}

/// Get a single endpoint by ID
#[allow(dead_code)]
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
}
