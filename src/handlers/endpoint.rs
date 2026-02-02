use crate::middleware::SessionId;
use crate::models::{CreateEndpointResponse, Endpoint};
use crate::services::endpoint;
use crate::websocket::WebSocketManager;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Extension, Json,
};
use sqlx::SqlitePool;
use std::sync::Arc;

/// Handler for POST /api/endpoints - Create a new endpoint
pub async fn create_endpoint(
    Extension(SessionId(session_id)): Extension<SessionId>,
    State((pool, _ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
) -> Result<Json<CreateEndpointResponse>, StatusCode> {
    match endpoint::create_endpoint(&pool, &session_id).await {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            tracing::error!("Failed to create endpoint: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Handler for GET /api/endpoints - List endpoints for current session
pub async fn list_endpoints(
    Extension(SessionId(session_id)): Extension<SessionId>,
    State((pool, _ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
) -> Result<Json<Vec<Endpoint>>, StatusCode> {
    match endpoint::list_endpoints(&pool, &session_id).await {
        Ok(endpoints) => Ok(Json(endpoints)),
        Err(e) => {
            tracing::error!("Failed to list endpoints: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Handler for GET /api/endpoints/:id - Get a single endpoint (allows claiming via URL)
/// This endpoint allows access without session check to enable URL sharing
/// But still filters by session in list_endpoints
pub async fn get_endpoint(
    Path(id): Path<String>,
    Extension(SessionId(session_id)): Extension<SessionId>,
    State((pool, _ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
) -> Result<Json<Endpoint>, StatusCode> {
    match endpoint::get_endpoint(&pool, &id).await {
        Ok(Some(mut endpoint)) => {
            // Update session_id to claim this endpoint for current session
            // This allows URL sharing - visiting /endpoint/{uuid} claims it
            if endpoint.session_id.is_none() || endpoint.session_id.as_ref() != Some(&session_id) {
                // Claim endpoint for this session
                let _ = sqlx::query("UPDATE endpoints SET session_id = ? WHERE id = ?")
                    .bind(&session_id)
                    .bind(&id)
                    .execute(&pool)
                    .await;
                endpoint.session_id = Some(session_id);
            }
            Ok(Json(endpoint))
        }
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            tracing::error!("Failed to get endpoint: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
