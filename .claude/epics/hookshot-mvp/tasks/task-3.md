---
name: task-3
title: REST API for endpoint and request management
status: open
github_issue: 4
github_url: https://github.com/datlechin/hookshot/issues/4
priority: critical
estimated_hours: 5
depends_on: [task-2]
created: 2026-01-29T13:58:40Z
updated: 2026-01-30T02:15:13Z
---

# REST API for endpoint and request management

Implement REST API endpoints for creating/listing/deleting webhook endpoints, listing requests with pagination and filters, and configuring custom responses. All CRUD operations for managing endpoints and viewing captured requests.

## Acceptance Criteria

- [ ] `POST /api/endpoints` - Create new endpoint, returns UUID
- [ ] `GET /api/endpoints` - List all endpoints with metadata (created_at, request_count)
- [ ] `DELETE /api/endpoints/:id` - Delete endpoint (cascade delete requests)
- [ ] `GET /api/endpoints/:id/requests?page=1&limit=50&method=POST` - Paginated request list with filters (method, page, limit)
- [ ] `GET /api/requests/:id` - Get single request details
- [ ] `PUT /api/endpoints/:id/response` - Update custom response config (status, headers, body, enabled)
- [ ] Validation: status codes 100-599, valid JSON for headers
- [ ] CORS headers configured for frontend access
- [ ] JSON response format consistent across all endpoints
- [ ] Integration tests for all API endpoints

## Files to create/modify

- `src/handlers/api.rs`
- `src/services/endpoint_service.rs`
- `tests/api_test.rs`

## Technical Notes

- Use Axum extractors (Json, Path, Query)
- Implement pagination using LIMIT/OFFSET
- Service layer handles business logic
- Return appropriate HTTP status codes (201, 204, 404, 400)
