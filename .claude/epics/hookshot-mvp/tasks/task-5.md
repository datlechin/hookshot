---
name: task-5
title: Frontend scaffolding with React, TypeScript, Vite, and shadcn/ui
status: open
github_issue: 6
github_url: https://github.com/datlechin/hookshot/issues/6
priority: high
estimated_hours: 4
depends_on: [task-3]
created: 2026-01-29T13:58:43Z
updated: 2026-01-30T02:15:13Z
---

# Frontend scaffolding with React, TypeScript, Vite, and shadcn/ui

Set up frontend project with React 18, TypeScript, Vite, Tailwind CSS, and shadcn/ui. Configure routing with React Router. Create base layout, API client, and WebSocket client utilities. Install shadcn/ui components needed for the app.

## Acceptance Criteria

- [ ] Vite project initialized with React + TypeScript template
- [ ] Tailwind CSS configured
- [ ] shadcn/ui initialized (dark mode support via next-themes)
- [ ] React Router configured with routes: `/` (Dashboard), `/endpoints/:id` (Endpoint View)
- [ ] Base `App.tsx` with layout and navigation
- [ ] API client (`lib/api.ts`) with functions for all REST endpoints
- [ ] WebSocket client (`lib/websocket.ts`) with reconnection logic
- [ ] shadcn/ui components installed: Button, Card, Table, Tabs, Dialog, Input, Badge, ScrollArea
- [ ] TypeScript types for Endpoint and Request models
- [ ] Dev server runs on `localhost:5173` and proxies API to `localhost:3000`

## Files to create

- `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`
- `frontend/src/main.tsx`, `frontend/src/App.tsx`
- `frontend/src/lib/api.ts`, `frontend/src/lib/websocket.ts`
- `frontend/src/types/index.ts`
- `frontend/components.json` (shadcn/ui config)
- `frontend/tailwind.config.js`

## Technical Notes

- Use Vite proxy for API requests during dev
- TanStack Query for data fetching (optional but recommended)
- WebSocket reconnection with exponential backoff
- Type-safe API client functions
