use axum::{
    extract::{
        ws::{Message, WebSocket},
        Path, State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use futures_util::{sink::SinkExt, stream::StreamExt};
use sqlx::SqlitePool;
use std::sync::Arc;
use tokio::sync::mpsc;
use tracing::{debug, error, info, warn};

use crate::models::Endpoint;
use crate::websocket::{WebSocketManager, WebSocketMessage};

/// WebSocket handler for endpoint subscriptions
pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    Path(endpoint_id): Path<String>,
    State((pool, ws_manager)): State<(SqlitePool, Arc<WebSocketManager>)>,
) -> impl IntoResponse {
    // Verify endpoint exists before upgrading connection
    let endpoint_exists = sqlx::query_as::<_, Endpoint>(
        "SELECT id, created_at, custom_response_enabled, response_status, response_headers, response_body, request_count FROM endpoints WHERE id = ? LIMIT 1"
    )
    .bind(&endpoint_id)
    .fetch_optional(&pool)
    .await
    .is_ok_and(|e| e.is_some());

    if !endpoint_exists {
        return axum::http::StatusCode::NOT_FOUND.into_response();
    }

    info!("WebSocket upgrade requested for endpoint: {}", endpoint_id);

    // Upgrade the connection
    ws.on_upgrade(move |socket| handle_websocket(socket, endpoint_id, ws_manager))
}

/// Handle an individual WebSocket connection
async fn handle_websocket(
    socket: WebSocket,
    endpoint_id: String,
    ws_manager: Arc<WebSocketManager>,
) {
    let (mut sender, mut receiver) = socket.split();

    // Create a channel for this client
    let (tx, mut rx) = mpsc::unbounded_channel::<WebSocketMessage>();

    // Register the client
    ws_manager
        .register_client(endpoint_id.clone(), tx.clone())
        .await;

    info!("WebSocket connected for endpoint: {}", endpoint_id);

    // Spawn a task to send messages to the client
    let endpoint_id_clone = endpoint_id.clone();
    let send_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            // Serialize message to JSON
            match serde_json::to_string(&msg) {
                Ok(json) => {
                    if let Err(e) = sender.send(Message::Text(json)).await {
                        error!("Failed to send WebSocket message: {}", e);
                        break;
                    }
                }
                Err(e) => {
                    error!("Failed to serialize WebSocket message: {}", e);
                }
            }
        }
        debug!("Send task ended for endpoint: {}", endpoint_id_clone);
    });

    // Spawn a task to receive messages from the client
    let endpoint_id_clone = endpoint_id.clone();
    let tx_clone = tx.clone();
    let ws_manager_clone = ws_manager.clone();
    let receive_task = tokio::spawn(async move {
        while let Some(result) = receiver.next().await {
            match result {
                Ok(Message::Text(text)) => {
                    debug!("Received text message: {}", text);

                    // Handle pong responses
                    if let Ok(msg) = serde_json::from_str::<WebSocketMessage>(&text) {
                        if matches!(msg, WebSocketMessage::Pong) {
                            debug!("Received pong from endpoint: {}", endpoint_id_clone);
                        }
                    }
                }
                Ok(Message::Close(_)) => {
                    info!(
                        "Client closed connection for endpoint: {}",
                        endpoint_id_clone
                    );
                    break;
                }
                Ok(Message::Ping(data)) => {
                    // Axum handles ping/pong automatically, but we can log it
                    debug!("Received ping, auto-responding with pong");
                    // The pong is sent automatically by the WebSocket protocol
                    let _ = data; // Suppress unused warning
                }
                Ok(Message::Pong(_)) => {
                    debug!("Received pong from endpoint: {}", endpoint_id_clone);
                }
                Err(e) => {
                    warn!("WebSocket error for endpoint {}: {}", endpoint_id_clone, e);
                    break;
                }
                _ => {
                    // Ignore binary messages
                }
            }
        }

        // Unregister when connection closes
        ws_manager_clone
            .unregister_client(&endpoint_id_clone, &tx_clone)
            .await;
        debug!("Receive task ended for endpoint: {}", endpoint_id_clone);
    });

    // Wait for either task to complete
    tokio::select! {
        _ = send_task => {
            info!("Send task completed for endpoint: {}", endpoint_id);
        }
        _ = receive_task => {
            info!("Receive task completed for endpoint: {}", endpoint_id);
        }
    }

    // Ensure client is unregistered
    ws_manager.unregister_client(&endpoint_id, &tx).await;
}
