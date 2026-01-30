---
name: task-4
title: WebSocket server for real-time request notifications
status: completed
github_issue: 5
github_url: https://github.com/datlechin/hookshot/issues/5
priority: high
estimated_hours: 6
depends_on: [task-2]
created: 2026-01-29T13:58:42Z
updated: 2026-01-30T02:15:13Z
---

# WebSocket server for real-time request notifications

Implement WebSocket server at `/ws/endpoints/:id` that broadcasts new request events to subscribed clients. Support multiple concurrent connections, heartbeat/ping for connection health, and efficient message broadcasting when webhooks arrive.

## Acceptance Criteria

- [ ] WebSocket endpoint at `/ws/endpoints/:id`
- [ ] Clients can subscribe to specific endpoint updates
- [ ] New request events broadcast to all connected clients for that endpoint (<100ms latency)
- [ ] Message format: `{"type": "new_request", "data": {id, method, received_at, ...}}`
- [ ] Heartbeat/ping every 30 seconds to detect stale connections
- [ ] Handle client disconnections gracefully
- [ ] Support minimum 100 concurrent WebSocket connections
- [ ] Integrate with webhook handler to broadcast on new requests
- [ ] WebSocket upgrade handshake works correctly

## Files to create/modify

- `src/handlers/websocket.rs`
- `src/websocket/mod.rs`, `src/websocket/manager.rs`
- `src/handlers/webhook.rs` (integrate broadcasting)
- `tests/websocket_test.rs`

## Technical Notes

- Use `axum::extract::ws::WebSocket`
- Shared state for managing connections (Arc<RwLock<HashMap>>)
- Broadcast channel for message distribution
- Graceful error handling for send failures
