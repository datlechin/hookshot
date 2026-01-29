-- Enable WAL mode for better concurrency
PRAGMA journal_mode=WAL;

-- Endpoints table
CREATE TABLE IF NOT EXISTS endpoints (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    custom_response_enabled BOOLEAN DEFAULT FALSE,
    response_status INTEGER DEFAULT 200,
    response_headers TEXT,
    response_body TEXT,
    request_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_endpoints_created ON endpoints(created_at DESC);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    query_string TEXT,
    headers TEXT NOT NULL,
    body BLOB,
    content_type TEXT,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_requests_endpoint_time ON requests(endpoint_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_method ON requests(endpoint_id, method);
