# Hookshot - OpenCode Project Instructions

## Project Overview

**Hookshot** is a self-hosted webhook testing tool (like webhook.site but with no paid limits).

Built with:

- **Backend:** Rust + Axum + SQLite
- **Frontend:** React + TypeScript + Vite + shadcn/ui + Tailwind
- **Deployment:** Single binary with embedded frontend

## Core Features to Implement

1. **Webhook Endpoints** - Auto-generated UUID endpoints (`/webhook/{uuid}`)
2. **Request Capture** - Store all HTTP methods, headers, body, metadata
3. **Custom Responses** - Configurable status codes, headers, response body
4. **Real-time Viewer** - WebSocket-based live updates when requests arrive
5. **Request Filtering/Search** - Filter by method, search in headers/body
6. **Request Forwarding** - Forward incoming webhooks to other URLs
7. **Rate Limiting** - Protect endpoints from abuse
8. **Request Replay** - Re-send captured requests to test endpoints
9. **Export** - Download requests as JSON/CSV/cURL commands
10. **Request History Limits** - Auto-delete old requests to save storage

## Project Management (CCPM)

This project uses **CCPM (Claude Code PM)** adapted for OpenCode. CCPM provides:

- ✅ **Structured Development** - PRD → Epic → Tasks → GitHub Issues
- ✅ **Context Preservation** - Never lose project state between sessions
- ✅ **Parallel Execution** - Multiple agents working on different tasks
- ✅ **Full Traceability** - Every decision documented from idea to code
- ✅ **GitHub Integration** - Issues as source of truth

### Key Commands Available

```bash
# Get help and see all commands
/pm:help

# Create a new feature PRD (Product Requirements Document)
/pm:prd-new <feature-name>

# Convert PRD to implementation epic
/pm:prd-parse <feature-name>

# Break epic into tasks and sync to GitHub
/pm:epic-oneshot <feature-name>

# Start working on a specific issue
/pm:issue-start <issue-number>

# Check overall project status
/pm:status

# Get next priority task
/pm:next

# Daily standup report
/pm:standup
```

## Development Workflow

### 1. Planning Phase

```bash
# Create a comprehensive PRD through guided brainstorming
/pm:prd-new webhook-capture

# Review and refine the PRD...
```

### 2. Implementation Planning

```bash
# Transform PRD into technical epic with task breakdown
/pm:prd-parse webhook-capture

# Review the epic and tasks...
```

### 3. Task Execution

```bash
# Push to GitHub and start execution
/pm:epic-oneshot webhook-capture

# Start work on a specific task
/pm:issue-start 1234

# Sync progress when ready
/pm:issue-sync 1234
```

## Architecture Guidelines

### Backend Structure

```
src/
├── main.rs              # Application entry, server setup
├── models/              # Data models (Endpoint, Request, Response)
├── handlers/            # Route handlers (API, webhook, websocket)
├── services/            # Business logic
├── db/                  # Database layer (SQLite via SQLx)
├── middleware/          # Rate limiting, CORS, etc.
└── websocket/           # WebSocket connection management
```

### Frontend Structure

```
frontend/
├── src/
│   ├── main.tsx         # App entry
│   ├── App.tsx          # Root component, routing
│   ├── lib/             # API client, WebSocket client
│   ├── hooks/           # Custom React hooks
│   ├── components/      # UI components (shadcn/ui + custom)
│   └── pages/           # Page components
```

### Database Schema (SQLite)

**endpoints** table:

- `id` (TEXT PRIMARY KEY) - UUID
- `created_at` (TIMESTAMP)
- `custom_response_enabled` (BOOLEAN)
- `response_status` (INTEGER)
- `response_headers` (TEXT/JSON)
- `response_body` (TEXT)
- `forward_url` (TEXT)
- `max_requests` (INTEGER) - History limit
- `rate_limit_per_minute` (INTEGER)

**requests** table:

- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `endpoint_id` (TEXT, FOREIGN KEY)
- `method` (TEXT)
- `path` (TEXT)
- `query_string` (TEXT)
- `headers` (TEXT/JSON)
- `body` (BLOB)
- `content_type` (TEXT)
- `received_at` (TIMESTAMP)
- `ip_address` (TEXT)

## Key Technical Decisions

1. **SQLite for storage** - Single-file database, zero setup, perfect for self-hosted
2. **WebSocket for real-time** - Efficient bi-directional communication
3. **Axum framework** - Modern async Rust with excellent WebSocket support
4. **Single binary deployment** - Embed frontend build into Rust executable
5. **shadcn/ui components** - Beautiful, accessible, customizable UI

## Getting Started

### Initialize CCPM

```bash
# Set up GitHub CLI and CCPM
/pm:init
```

### Create First Feature

```bash
# Start with the core webhook capture feature
/pm:prd-new webhook-endpoint-generation
```

## Important Notes

- All planning work happens in `.opencode/prds/` (local)
- Epic implementation plans in `.opencode/epics/` (local, gitignored)
- Tasks synced to GitHub as issues for tracking
- Use `/pm:status` frequently to stay oriented
- Each issue should have clear acceptance criteria
- Mark tasks with `parallel: true` when they can run concurrently

## Resources

- Axum Framework: [docs.rs/axum](https://docs.rs/axum)
- shadcn/ui: [ui.shadcn.com](https://ui.shadcn.com)
- SQLx: [docs.rs/sqlx](https://docs.rs/sqlx)

---

**Ready to start building?** Run `/pm:init` to initialize the project management system!
