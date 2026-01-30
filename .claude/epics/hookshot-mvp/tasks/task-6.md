---
name: task-6
title: Dashboard and Endpoint View pages with real-time request list
status: completed
github_issue: 7
github_url: https://github.com/datlechin/hookshot/issues/7
priority: high
estimated_hours: 7
depends_on: [task-5]
created: 2026-01-29T13:58:45Z
updated: 2026-01-30T02:15:13Z
---

# Dashboard and Endpoint View pages with real-time request list

Build the two main pages: Dashboard (list all endpoints) and Endpoint View (show requests for a specific endpoint with real-time updates). Implement components for endpoint list, request list, and real-time WebSocket integration.

## Acceptance Criteria

- [ ] Dashboard page (`pages/Dashboard.tsx`) shows all endpoints with creation time and request count
- [ ] "New Endpoint" button creates endpoint and navigates to its view
- [ ] Copy endpoint URL to clipboard with visual feedback
- [ ] Endpoint View page (`pages/EndpointView.tsx`) displays request list for specific endpoint
- [ ] Request list shows: timestamp, method, status, size (reverse chronological order)
- [ ] Real-time updates: new requests appear instantly via WebSocket
- [ ] Pagination (50 requests per page) with "Load More" or infinite scroll
- [ ] Click request to view details (modal or side panel)
- [ ] Visual notification when new request arrives (badge, animation)
- [ ] WebSocket auto-reconnects on connection loss
- [ ] Loading states and error handling

## Files to create

- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/EndpointView.tsx`
- `frontend/src/components/EndpointList.tsx`
- `frontend/src/components/RequestList.tsx`
- `frontend/src/hooks/useEndpoints.ts`
- `frontend/src/hooks/useRequests.ts`
- `frontend/src/hooks/useWebSocket.ts`

## Technical Notes

- Use shadcn/ui Card for endpoint items
- Use shadcn/ui Table for request list
- WebSocket hook merges real-time updates with paginated data
- Copy-to-clipboard using Clipboard API
