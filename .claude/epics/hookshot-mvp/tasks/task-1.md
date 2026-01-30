---
name: task-1
title: Backend foundation: Database, models, and basic server setup
status: completed
github_issue: 2
github_url: https://github.com/datlechin/hookshot/issues/2
priority: critical
estimated_hours: 6
depends_on: []
created: 2026-01-29T13:58:36Z
updated: 2026-01-30T02:15:13Z
---

# Backend foundation: Database, models, and basic server setup

Set up the Rust project with Axum, SQLx, and SQLite. Create database schema with migrations for `endpoints` and `requests` tables. Implement data models and connection pool with WAL mode. Create basic server that binds to localhost:3000 and serves a hello world response.

## Acceptance Criteria

- [ ] Cargo project initialized with dependencies (Axum, SQLx, Tokio, Serde, UUID, Tower)
- [ ] SQLite database schema with `endpoints` table (id, created_at, custom_response_enabled, response_status, response_headers, response_body, request_count)
- [ ] SQLite database schema with `requests` table (id, endpoint_id, method, path, query_string, headers, body, content_type, received_at, ip_address)
- [ ] Indexes on `endpoint_id` and `received_at` for efficient querying
- [ ] Database migrations using SQLx
- [ ] WAL mode enabled for concurrent reads
- [ ] Connection pool configured
- [ ] Rust models for Endpoint and Request structs
- [ ] Server starts on localhost:3000 and responds to basic health check
- [ ] Database auto-creates on first run at `./hookshot.db`

## Files to create

- `Cargo.toml`
- `src/main.rs`
- `src/models/mod.rs`, `src/models/endpoint.rs`, `src/models/request.rs`
- `src/db/mod.rs`, `src/db/migrations.rs`
- `migrations/001_initial_schema.sql`

## Technical Notes

- Use SQLx compile-time query verification
- Enable SQLite WAL mode via PRAGMA statements
- Use UUID v4 for endpoint IDs
- Store headers as JSON TEXT for flexibility
