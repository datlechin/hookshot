pub mod api;
pub mod endpoint;
pub mod webhook;

use axum::Json;
use serde_json::{json, Value};

/// Health check endpoint
pub async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "message": "Hookshot server is running"
    }))
}
