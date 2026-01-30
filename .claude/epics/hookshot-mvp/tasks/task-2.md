---
name: task-2
title: Webhook capture handler with full request storage
status: completed
github_issue: 3
github_url: https://github.com/datlechin/hookshot/issues/3
priority: critical
estimated_hours: 6
depends_on: [task-1]
created: 2026-01-29T13:58:38Z
updated: 2026-01-30T02:15:13Z
---

# Webhook capture handler with full request storage

Implement the core webhook capture handler at `/webhook/{uuid}`. Accept all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS), capture complete request details (method, path, query, headers, body up to 10MB, IP, timestamp), store in SQLite, and return appropriate response (custom or default 200 OK).

## Acceptance Criteria

- [ ] Handler accepts requests on `/webhook/{uuid}` route
- [ ] All HTTP methods supported (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- [ ] Capture: method, full path, query string, all headers (as JSON), body (up to 10MB), Content-Type, client IP, timestamp (millisecond precision)
- [ ] Store captured request in `requests` table
- [ ] Return custom response if configured (status code, headers, body)
- [ ] Return default 200 OK if no custom response
- [ ] Handle 404 for non-existent endpoint UUIDs
- [ ] Handle oversized requests (>10MB) gracefully with 413 Payload Too Large
- [ ] Integration tests for all HTTP methods
- [ ] Integration test for custom response

## Files to create/modify

- `src/handlers/mod.rs`, `src/handlers/webhook.rs`
- `src/services/mod.rs`, `src/services/request_service.rs`
- `tests/webhook_capture_test.rs`

## Technical Notes

- Use Axum's `extract::Path` for UUID
- Use `axum::body::Bytes` for body capture
- Limit body size with `DefaultBodyLimit` middleware
- Use service layer pattern for testability
