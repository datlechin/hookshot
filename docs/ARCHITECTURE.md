# Hookshot Architecture

This document provides an overview of Hookshot's architecture, design decisions, and technical implementation.

## Overview

Hookshot is a self-hosted webhook testing tool built as a single binary application. It combines a Rust backend with a React frontend, all packaged into one executable with no external dependencies.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│                    (Browser/cURL/etc)                        │
└───────────────────┬──────────────────┬──────────────────────┘
                    │                  │
         HTTP/HTTPS │                  │ WebSocket
                    │                  │
┌───────────────────▼──────────────────▼──────────────────────┐
│                  Axum HTTP Server                            │
│                  (Port 3000)                                 │
├──────────────────────────────────────────────────────────────┤
│  Routes:                                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ /api/*          → REST API (Endpoints, Requests)       │ │
│  │ /webhook/:id    → Webhook Capture Handler             │ │
│  │ /ws/endpoints/* → WebSocket Handler                   │ │
│  │ /*              → Static File Server (Frontend SPA)   │ │
│  └────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  Middleware:                                                 │
│  • CORS (allow all origins)                                 │
│  • Compression (gzip)                                       │
│  • Request tracing                                          │
└───────────────────┬──────────────────┬──────────────────────┘
                    │                  │
          ┌─────────▼────────┐   ┌────▼──────────┐
          │    Handlers      │   │   WebSocket   │
          │    (API/Webhook) │   │    Manager    │
          └─────────┬────────┘   └────┬──────────┘
                    │                  │
          ┌─────────▼─────────┐  ┌────▼──────────────────┐
          │     Services      │  │  Active Connections   │
          │  (Business Logic) │  │  (endpoint_id → ws)   │
          └─────────┬─────────┘  └───────────────────────┘
                    │
          ┌─────────▼─────────┐
          │    Database       │
          │    (SQLite)       │
          │  • endpoints      │
          │  • requests       │
          └───────────────────┘
```

## Technology Stack

### Backend (Rust)

- **Axum** - Modern, ergonomic web framework built on Tokio
- **Tokio** - Async runtime for concurrent I/O operations
- **SQLx** - Compile-time checked SQL queries with async support
- **SQLite** - Embedded database, zero configuration
- **Tower** - Middleware and service abstractions
- **Serde** - Serialization/deserialization
- **Tracing** - Structured logging

### Frontend (React)

- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **shadcn/ui** - Accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI primitives

### Build System

- **Rust build.rs** - Custom build script
- **Node.js/npm** - Frontend dependency management
- **include_dir** - Embed static files at compile time

## Core Components

### 1. HTTP Server (main.rs)

Entry point that:
- Initializes tracing/logging
- Creates database connection pool
- Sets up WebSocket manager
- Configures routes and middleware
- Starts Axum server on port 3000

### 2. Database Layer (db/)

**Schema:**

```sql
-- endpoints table
CREATE TABLE endpoints (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    custom_response_enabled BOOLEAN DEFAULT FALSE,
    response_status INTEGER DEFAULT 200,
    response_headers TEXT DEFAULT '{}',
    response_body TEXT,
    forward_url TEXT,
    max_requests INTEGER,
    rate_limit_per_minute INTEGER
);

-- requests table
CREATE TABLE requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    query_string TEXT,
    headers TEXT NOT NULL,
    body BLOB,
    content_type TEXT,
    received_at TIMESTAMP NOT NULL,
    ip_address TEXT,
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_requests_endpoint_id ON requests(endpoint_id);
CREATE INDEX idx_requests_received_at ON requests(received_at);
```

**Connection Pool:**
- SQLx async connection pool
- Automatic connection management
- Migration runner on startup

### 3. Handlers (handlers/)

#### API Handlers (handlers/api.rs, handlers/endpoint.rs)

RESTful endpoints for:
- Creating webhook endpoints (POST /api/endpoints)
- Listing endpoints (GET /api/endpoints)
- Deleting endpoints (DELETE /api/endpoints/:id)
- Updating response config (PUT /api/endpoints/:id/response)
- Fetching endpoint requests (GET /api/endpoints/:id/requests)
- Fetching specific request (GET /api/requests/:id)

#### Webhook Handler (handlers/webhook.rs)

Captures incoming webhooks:
1. Accept any HTTP method (GET, POST, PUT, DELETE, etc.)
2. Extract endpoint ID from path
3. Capture full request (method, headers, query, body)
4. Store in database
5. Notify WebSocket subscribers
6. Return configured custom response OR default 200 OK

#### WebSocket Handler (handlers/websocket.rs)

Real-time updates:
1. Accept WebSocket connection for endpoint
2. Register connection in WebSocket manager
3. Send heartbeat pings every 30s
4. Broadcast new requests to all subscribers
5. Clean up on disconnect

### 4. Services (services/)

Business logic layer:

**endpoint.rs:**
- `create_endpoint()` - Generate UUID, insert into DB
- `list_endpoints()` - Fetch all endpoints
- `delete_endpoint()` - Remove endpoint and requests
- `update_response_config()` - Update custom response

**request.rs:**
- `save_request()` - Store captured request
- `get_requests()` - Fetch requests for endpoint
- `get_request_by_id()` - Fetch specific request

### 5. WebSocket Manager (websocket/)

Manages active WebSocket connections:

```rust
struct WebSocketManager {
    // endpoint_id -> Vec<Sender>
    connections: RwLock<HashMap<String, Vec<Sender>>>
}
```

Features:
- Thread-safe connection registry
- Subscribe/unsubscribe per endpoint
- Broadcast messages to all subscribers
- Automatic cleanup of closed connections
- Heartbeat to keep connections alive

### 6. Static File Server (static_files.rs)

Serves embedded frontend:
- Frontend built during `cargo build`
- All files embedded via `include_dir!` macro
- Served with correct MIME types
- SPA fallback (all routes → index.html)
- Gzip compression via middleware

## Request Flow

### Webhook Capture Flow

```
1. HTTP Request arrives at /webhook/:id
   ↓
2. Webhook Handler extracts request data
   ↓
3. Services layer saves to database
   ↓
4. WebSocket Manager broadcasts to subscribers
   ↓
5. Handler returns custom or default response
```

### Real-time Update Flow

```
1. Browser connects to /ws/endpoints/:id
   ↓
2. WebSocket Handler registers connection
   ↓
3. New webhook arrives (see above)
   ↓
4. WebSocket Manager sends message to all subscribers
   ↓
5. Browser receives and displays new request
```

### API Request Flow

```
1. HTTP Request arrives at /api/*
   ↓
2. API Handler processes request
   ↓
3. Services layer performs business logic
   ↓
4. Database operation (read/write)
   ↓
5. JSON response returned to client
```

## Design Decisions

### Why Rust?

- **Performance** - Native performance, minimal overhead
- **Safety** - Memory safety without garbage collection
- **Concurrency** - Fearless concurrency with async/await
- **Single Binary** - Easy deployment, no runtime dependencies
- **Type Safety** - Catch errors at compile time

### Why SQLite?

- **Zero Configuration** - No database server required
- **Self-Contained** - Single file, easy to backup
- **ACID Compliant** - Reliable data storage
- **Good Performance** - Sufficient for webhook testing
- **Portable** - Works everywhere

### Why Axum?

- **Modern** - Built on latest async Rust ecosystem
- **Ergonomic** - Type-safe extractors and responses
- **Performant** - Minimal overhead, fast routing
- **WebSocket Support** - First-class WebSocket support
- **Middleware** - Tower-based middleware system

### Why Embedded Frontend?

- **Simple Deployment** - One binary, no static file management
- **Fast Startup** - No file I/O for static assets
- **Portable** - Works anywhere without setup
- **Versioning** - Frontend and backend always in sync

## Scalability Considerations

### Current Limitations

- Single SQLite database (not suitable for high concurrency writes)
- In-memory WebSocket connection registry (doesn't scale horizontally)
- Single server instance (no built-in load balancing)

### Future Improvements

For production/high-traffic scenarios:

1. **Database:**
   - Add PostgreSQL/MySQL support
   - Connection pooling configuration
   - Read replicas for queries

2. **WebSocket:**
   - Redis pub/sub for distributed WebSocket
   - Sticky sessions for load balancing
   - Connection limit per endpoint

3. **Storage:**
   - S3/object storage for large request bodies
   - Request body size limits
   - Automatic cleanup policies

4. **Performance:**
   - Request rate limiting
   - Response caching
   - CDN for static assets

## Security Considerations

### Current Implementation

- **CORS** - Allows all origins (suitable for testing tool)
- **No Authentication** - Self-hosted, trusted environment assumed
- **SQLite** - File-based, protect file permissions
- **Rate Limiting** - Basic per-endpoint rate limiting (TODO)

### Production Hardening

If deploying publicly:

1. Add authentication (API keys, OAuth)
2. Implement proper rate limiting
3. Add request size limits
4. Use HTTPS (reverse proxy like Nginx)
5. Set CORS allowlist
6. Add request validation
7. Implement tenant isolation

## Development

### Build Process

```
1. cargo build triggers build.rs
   ↓
2. build.rs checks for frontend/dist
   ↓
3. If missing, runs: cd frontend && npm install && npm run build
   ↓
4. Frontend builds to frontend/dist/
   ↓
5. Rust compile embeds frontend/dist/ via include_dir!
   ↓
6. Single binary produced with embedded frontend
```

### Testing Strategy

**Unit Tests:**
- Services layer (business logic)
- Models (serialization)
- Utilities

**Integration Tests:**
- API endpoints (in tests/)
- Database operations
- WebSocket behavior

**Manual Testing:**
- Frontend UI flows
- Real webhook scenarios
- Browser compatibility

## Monitoring and Observability

### Logging

- **Tracing** - Structured logging throughout
- **Levels** - Debug, info, warn, error
- **Context** - Request IDs, endpoint IDs
- **Configuration** - Via RUST_LOG env var

### Metrics (Future)

Potential additions:
- Request count per endpoint
- Response time percentiles
- Active WebSocket connections
- Database query performance

## Deployment

### Production Deployment

```bash
# Build optimized binary
cargo build --release

# Binary at: target/release/hookshot
# Size: ~7.5MB
# Dependencies: None (fully static)

# Run with custom config
DATABASE_URL=sqlite:/data/hookshot.db \
RUST_LOG=info \
./hookshot
```

### Docker Deployment (Future)

```dockerfile
FROM scratch
COPY hookshot /hookshot
EXPOSE 3000
CMD ["/hookshot"]
```

### Systemd Service

```ini
[Unit]
Description=Hookshot Webhook Testing Tool
After=network.target

[Service]
Type=simple
User=hookshot
WorkingDirectory=/opt/hookshot
Environment=DATABASE_URL=sqlite:/opt/hookshot/data/hookshot.db
Environment=RUST_LOG=info
ExecStart=/opt/hookshot/hookshot
Restart=always

[Install]
WantedBy=multi-user.target
```

## Conclusion

Hookshot's architecture prioritizes simplicity, performance, and ease of deployment. The single binary approach makes it ideal for self-hosting, while the modern tech stack ensures good performance and developer experience.

The modular design allows for future enhancements while maintaining backwards compatibility. The system is well-suited for webhook testing scenarios where simplicity and reliability are more important than extreme scale.
