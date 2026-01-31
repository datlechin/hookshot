use hookshot::websocket::{RequestData, WebSocketManager, WebSocketMessage};
use tokio::sync::mpsc;

#[tokio::test]
async fn test_websocket_manager_registration() {
    let manager = WebSocketManager::new();
    let (tx, _rx) = mpsc::unbounded_channel();

    // Register client
    manager
        .register_client("test-endpoint".to_string(), tx.clone())
        .await;

    // Check client count
    let count = manager.client_count("test-endpoint").await;
    assert_eq!(count, 1);

    // Unregister client
    manager.unregister_client("test-endpoint", &tx).await;

    // Check client count after unregister
    let count = manager.client_count("test-endpoint").await;
    assert_eq!(count, 0);
}

#[tokio::test]
async fn test_websocket_manager_multiple_clients() {
    let manager = WebSocketManager::new();
    let (tx1, _rx1) = mpsc::unbounded_channel();
    let (tx2, _rx2) = mpsc::unbounded_channel();
    let (tx3, _rx3) = mpsc::unbounded_channel();

    // Register multiple clients for same endpoint
    manager.register_client("endpoint1".to_string(), tx1).await;
    manager.register_client("endpoint1".to_string(), tx2).await;

    // Register client for different endpoint
    manager.register_client("endpoint2".to_string(), tx3).await;

    // Check counts
    assert_eq!(manager.client_count("endpoint1").await, 2);
    assert_eq!(manager.client_count("endpoint2").await, 1);
    assert_eq!(manager.total_connections().await, 3);
}

#[tokio::test]
async fn test_websocket_broadcast() {
    let manager = WebSocketManager::new();
    let (tx1, mut rx1) = mpsc::unbounded_channel();
    let (tx2, mut rx2) = mpsc::unbounded_channel();

    // Register two clients
    manager.register_client("endpoint1".to_string(), tx1).await;
    manager.register_client("endpoint1".to_string(), tx2).await;

    // Create test message
    let message = WebSocketMessage::NewRequest {
        data: RequestData {
            id: 123,
            endpoint_id: "endpoint1".to_string(),
            method: "POST".to_string(),
            path: "/test".to_string(),
            query_string: Some("foo=bar".to_string()),
            query_params: serde_json::json!("foo=bar"),
            headers: serde_json::json!({}),
            body: Some("{\"test\": true}".to_string()),
            content_type: Some("application/json".to_string()),
            received_at: "2024-01-01T00:00:00Z".to_string(),
            ip_address: Some("127.0.0.1".to_string()),
        },
    };

    // Broadcast message
    manager.broadcast("endpoint1", message).await;

    // Both clients should receive the message
    let msg1 = rx1.recv().await.unwrap();
    let msg2 = rx2.recv().await.unwrap();

    match (msg1, msg2) {
        (WebSocketMessage::NewRequest { data: d1 }, WebSocketMessage::NewRequest { data: d2 }) => {
            assert_eq!(d1.id, 123);
            assert_eq!(d2.id, 123);
            assert_eq!(d1.method, "POST");
            assert_eq!(d2.method, "POST");
        }
        _ => panic!("Unexpected message type"),
    }
}

#[tokio::test]
async fn test_websocket_broadcast_to_non_existent_endpoint() {
    let manager = WebSocketManager::new();

    // Broadcasting to endpoint with no clients should not panic
    let message = WebSocketMessage::Ping;
    manager.broadcast("non-existent", message).await;

    // Should complete without error
    assert_eq!(manager.client_count("non-existent").await, 0);
}

#[tokio::test]
async fn test_websocket_heartbeat() {
    let manager = WebSocketManager::new();
    let (tx1, mut rx1) = mpsc::unbounded_channel();
    let (tx2, mut rx2) = mpsc::unbounded_channel();

    manager.register_client("endpoint1".to_string(), tx1).await;
    manager.register_client("endpoint2".to_string(), tx2).await;

    // Send heartbeat
    manager.send_heartbeat().await;

    // Both clients should receive ping
    let msg1 = rx1.recv().await.unwrap();
    let msg2 = rx2.recv().await.unwrap();

    assert!(matches!(msg1, WebSocketMessage::Ping));
    assert!(matches!(msg2, WebSocketMessage::Ping));
}

#[tokio::test]
async fn test_concurrent_registrations() {
    let manager = WebSocketManager::new();
    let mut handles = vec![];

    // Spawn 100 concurrent registration tasks
    for i in 0..100 {
        let manager_clone = manager.clone();
        let handle = tokio::spawn(async move {
            let (tx, _rx) = mpsc::unbounded_channel();
            let endpoint_id = format!("endpoint-{}", i % 10); // 10 different endpoints
            manager_clone.register_client(endpoint_id, tx).await;
        });
        handles.push(handle);
    }

    // Wait for all tasks to complete
    for handle in handles {
        handle.await.unwrap();
    }

    // Each of 10 endpoints should have 10 clients
    assert_eq!(manager.total_connections().await, 100);

    for i in 0..10 {
        let endpoint_id = format!("endpoint-{}", i);
        assert_eq!(manager.client_count(&endpoint_id).await, 10);
    }
}

#[tokio::test]
async fn test_websocket_message_serialization() {
    // Test that messages can be serialized to JSON
    let message = WebSocketMessage::NewRequest {
        data: RequestData {
            id: 456,
            endpoint_id: "test-endpoint".to_string(),
            method: "GET".to_string(),
            path: "/api/test".to_string(),
            query_string: None,
            query_params: serde_json::Value::Null,
            headers: serde_json::json!({"content-type":"text/plain"}),
            body: None,
            content_type: Some("text/plain".to_string()),
            received_at: "2024-01-01T12:00:00Z".to_string(),
            ip_address: Some("192.168.1.1".to_string()),
        },
    };

    let json = serde_json::to_string(&message).unwrap();
    assert!(json.contains("\"type\":\"new_request\""));
    assert!(json.contains("\"id\":456"));
    assert!(json.contains("\"method\":\"GET\""));

    // Test ping/pong serialization
    let ping = WebSocketMessage::Ping;
    let ping_json = serde_json::to_string(&ping).unwrap();
    assert!(ping_json.contains("\"type\":\"ping\""));

    let pong = WebSocketMessage::Pong;
    let pong_json = serde_json::to_string(&pong).unwrap();
    assert!(pong_json.contains("\"type\":\"pong\""));
}

#[tokio::test]
async fn test_broadcast_with_dropped_receiver() {
    let manager = WebSocketManager::new();
    let (tx1, rx1) = mpsc::unbounded_channel();
    let (tx2, mut rx2) = mpsc::unbounded_channel();

    manager.register_client("endpoint1".to_string(), tx1).await;
    manager.register_client("endpoint1".to_string(), tx2).await;

    // Drop one receiver
    drop(rx1);

    // Broadcast should still work for the remaining client
    let message = WebSocketMessage::Ping;
    manager.broadcast("endpoint1", message).await;

    // The working receiver should still get the message
    let msg = rx2.recv().await.unwrap();
    assert!(matches!(msg, WebSocketMessage::Ping));
}

#[tokio::test]
async fn test_rapid_broadcast() {
    let manager = WebSocketManager::new();
    let (tx, mut rx) = mpsc::unbounded_channel();

    manager.register_client("endpoint1".to_string(), tx).await;

    // Send 1000 messages rapidly
    for i in 0..1000 {
        let message = WebSocketMessage::NewRequest {
            data: RequestData {
                id: i,
                endpoint_id: "endpoint1".to_string(),
                method: "POST".to_string(),
                path: "/test".to_string(),
                query_string: None,
                query_params: serde_json::Value::Null,
                headers: serde_json::json!({}),
                body: None,
                content_type: None,
                received_at: "2024-01-01T00:00:00Z".to_string(),
                ip_address: None,
            },
        };
        manager.broadcast("endpoint1", message).await;
    }

    // Verify all messages were received
    for i in 0..1000 {
        let msg = rx.recv().await.unwrap();
        if let WebSocketMessage::NewRequest { data } = msg {
            assert_eq!(data.id, i);
        } else {
            panic!("Expected NewRequest message");
        }
    }
}

#[tokio::test]
async fn test_latency_requirement() {
    let manager = WebSocketManager::new();
    let (tx, mut rx) = mpsc::unbounded_channel();

    manager.register_client("endpoint1".to_string(), tx).await;

    let message = WebSocketMessage::NewRequest {
        data: RequestData {
            id: 1,
            endpoint_id: "endpoint1".to_string(),
            method: "POST".to_string(),
            path: "/test".to_string(),
            query_string: None,
            query_params: serde_json::Value::Null,
            headers: serde_json::json!({}),
            body: None,
            content_type: None,
            received_at: "2024-01-01T00:00:00Z".to_string(),
            ip_address: None,
        },
    };

    // Measure broadcast time
    let start = std::time::Instant::now();
    manager.broadcast("endpoint1", message).await;
    let broadcast_time = start.elapsed();

    // Receive message
    let _msg = rx.recv().await.unwrap();
    let total_time = start.elapsed();

    // Should be well under 100ms (the acceptance criteria)
    assert!(
        total_time.as_millis() < 100,
        "Latency too high: {:?}",
        total_time
    );
    println!("Broadcast latency: {:?}", broadcast_time);
    println!("Total latency: {:?}", total_time);
}
