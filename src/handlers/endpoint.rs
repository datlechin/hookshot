use crate::models::{CreateEndpointResponse, Endpoint, EndpointSummary};
use crate::services::endpoint;
use crate::websocket::WebSocketManager;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use sqlx::SqlitePool;
use std::sync::Arc;

/// Handler for POST /api/endpoints - Create a new endpoint
pub async fn create_endpoint(
    State((pool, _ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
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
    State((pool, _ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
) -> Result<Json<Vec<EndpointSummary>>, StatusCode> {
    match endpoint::list_endpoints(&pool).await {
        Ok(endpoints) => Ok(Json(endpoints)),
        Err(e) => {
            tracing::error!("Failed to list endpoints: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Handler for GET /api/endpoints/:id - Get a single endpoint
pub async fn get_endpoint(
    Path(id): Path<String>,
    State((pool, _ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
) -> Result<Json<Endpoint>, StatusCode> {
    match endpoint::get_endpoint(&pool, &id).await {
        Ok(Some(endpoint)) => Ok(Json(endpoint)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to get endpoint: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
