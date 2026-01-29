use crate::models::{CreateEndpointResponse, EndpointSummary};
use crate::services::endpoint;
use axum::{extract::State, http::StatusCode, Json};
use sqlx::SqlitePool;

/// Handler for POST /api/endpoints - Create a new endpoint
pub async fn create_endpoint(
    State(pool): State<SqlitePool>,
) -> Result<Json<CreateEndpointResponse>, StatusCode> {
    match endpoint::create_endpoint(&pool).await {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            tracing::error!("Failed to create endpoint: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Handler for GET /api/endpoints - List all endpoints
pub async fn list_endpoints(
    State(pool): State<SqlitePool>,
) -> Result<Json<Vec<EndpointSummary>>, StatusCode> {
    match endpoint::list_endpoints(&pool).await {
        Ok(endpoints) => Ok(Json(endpoints)),
        Err(e) => {
            tracing::error!("Failed to list endpoints: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
