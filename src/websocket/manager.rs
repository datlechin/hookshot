use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tracing::{debug, error, info};

/// Message types for WebSocket communication
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum WebSocketMessage {
    #[serde(rename = "new_request")]
    NewRequest { data: RequestData },
    #[serde(rename = "ping")]
    Ping,
    #[serde(rename = "pong")]
    Pong,
}

/// Request data for new_request messages
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestData {
    pub id: i64,
    pub method: String,
    pub path: String,
    pub query_string: Option<String>,
    pub headers: String,
    pub content_type: Option<String>,
    pub received_at: String,
    pub ip_address: Option<String>,
}

/// Client connection handle
#[derive(Debug, Clone)]
pub struct ClientHandle {
    pub tx: mpsc::UnboundedSender<WebSocketMessage>,
}

/// WebSocket connection manager
#[derive(Clone)]
pub struct WebSocketManager {
    /// Map of endpoint_id -> list of client channels
    connections: Arc<RwLock<HashMap<String, Vec<ClientHandle>>>>,
}

impl WebSocketManager {
    /// Create a new WebSocket manager
    pub fn new() -> Self {
        Self {
            connections: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Register a new client for an endpoint
    pub async fn register_client(
        &self,
        endpoint_id: String,
        tx: mpsc::UnboundedSender<WebSocketMessage>,
    ) {
        let mut connections = self.connections.write().await;
        let clients = connections
            .entry(endpoint_id.clone())
            .or_insert_with(Vec::new);
        clients.push(ClientHandle { tx });

        info!(
            "Client registered for endpoint {}. Total clients: {}",
            endpoint_id,
            clients.len()
        );
    }

    /// Unregister a client
    pub async fn unregister_client(
        &self,
        endpoint_id: &str,
        client_tx: &mpsc::UnboundedSender<WebSocketMessage>,
    ) {
        let mut connections = self.connections.write().await;
        if let Some(clients) = connections.get_mut(endpoint_id) {
            // Remove the client by comparing the sender addresses
            clients.retain(|handle| !handle.tx.same_channel(client_tx));

            info!(
                "Client unregistered from endpoint {}. Remaining clients: {}",
                endpoint_id,
                clients.len()
            );

            // Clean up empty endpoint entries
            if clients.is_empty() {
                connections.remove(endpoint_id);
                debug!("Removed empty endpoint entry: {}", endpoint_id);
            }
        }
    }

    /// Broadcast a message to all clients subscribed to an endpoint
    pub async fn broadcast(&self, endpoint_id: &str, message: WebSocketMessage) {
        let connections = self.connections.read().await;

        if let Some(clients) = connections.get(endpoint_id) {
            let mut failed_count = 0;
            let total_clients = clients.len();

            for client in clients.iter() {
                if let Err(e) = client.tx.send(message.clone()) {
                    error!("Failed to send message to client: {}", e);
                    failed_count += 1;
                }
            }

            if failed_count > 0 {
                info!(
                    "Broadcast to endpoint {}: {}/{} clients succeeded",
                    endpoint_id,
                    total_clients - failed_count,
                    total_clients
                );
            } else {
                debug!(
                    "Successfully broadcast to {} clients for endpoint {}",
                    total_clients, endpoint_id
                );
            }
        } else {
            debug!("No clients connected for endpoint {}", endpoint_id);
        }
    }

    /// Get the number of connected clients for an endpoint
    #[allow(dead_code)]
    pub async fn client_count(&self, endpoint_id: &str) -> usize {
        let connections = self.connections.read().await;
        connections.get(endpoint_id).map(|c| c.len()).unwrap_or(0)
    }

    /// Get total number of connections across all endpoints
    #[allow(dead_code)]
    pub async fn total_connections(&self) -> usize {
        let connections = self.connections.read().await;
        connections.values().map(|v| v.len()).sum()
    }

    /// Send heartbeat pings to all clients
    pub async fn send_heartbeat(&self) {
        let connections = self.connections.read().await;
        let ping_message = WebSocketMessage::Ping;

        let mut total_sent = 0;
        let mut total_failed = 0;

        for (endpoint_id, clients) in connections.iter() {
            for client in clients {
                match client.tx.send(ping_message.clone()) {
                    Ok(_) => total_sent += 1,
                    Err(_) => {
                        total_failed += 1;
                        debug!("Failed to send ping to client on endpoint {}", endpoint_id);
                    }
                }
            }
        }

        if total_sent > 0 || total_failed > 0 {
            debug!("Heartbeat: sent={}, failed={}", total_sent, total_failed);
        }
    }
}

impl Default for WebSocketManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_register_and_unregister_client() {
        let manager = WebSocketManager::new();
        let (tx, _rx) = mpsc::unbounded_channel();

        // Register client
        manager
            .register_client("endpoint1".to_string(), tx.clone())
            .await;
        assert_eq!(manager.client_count("endpoint1").await, 1);

        // Unregister client
        manager.unregister_client("endpoint1", &tx).await;
        assert_eq!(manager.client_count("endpoint1").await, 0);
    }

    #[tokio::test]
    async fn test_multiple_clients() {
        let manager = WebSocketManager::new();
        let (tx1, _rx1) = mpsc::unbounded_channel();
        let (tx2, _rx2) = mpsc::unbounded_channel();

        manager.register_client("endpoint1".to_string(), tx1).await;
        manager.register_client("endpoint1".to_string(), tx2).await;

        assert_eq!(manager.client_count("endpoint1").await, 2);
        assert_eq!(manager.total_connections().await, 2);
    }

    #[tokio::test]
    async fn test_broadcast() {
        let manager = WebSocketManager::new();
        let (tx, mut rx) = mpsc::unbounded_channel();

        manager.register_client("endpoint1".to_string(), tx).await;

        let message = WebSocketMessage::NewRequest {
            data: RequestData {
                id: 1,
                method: "POST".to_string(),
                path: "/test".to_string(),
                query_string: None,
                headers: "{}".to_string(),
                content_type: Some("application/json".to_string()),
                received_at: "2024-01-01T00:00:00Z".to_string(),
                ip_address: Some("127.0.0.1".to_string()),
            },
        };

        manager.broadcast("endpoint1", message.clone()).await;

        let received = rx.recv().await.unwrap();
        match received {
            WebSocketMessage::NewRequest { data } => {
                assert_eq!(data.id, 1);
                assert_eq!(data.method, "POST");
            }
            _ => panic!("Unexpected message type"),
        }
    }
}
