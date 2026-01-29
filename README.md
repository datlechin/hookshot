# Hookshot 🎯

A self-hosted webhook testing tool built with Rust and React - like webhook.site but with no paid limits.

## Tech Stack

**Backend:**

- Rust + Axum
- SQLite (via SQLx)
- WebSocket for real-time updates

**Frontend:**

- React + TypeScript
- Vite
- shadcn/ui + Tailwind CSS

## Core Features

- ✅ **Webhook Endpoint Generation** - Auto-generated UUID endpoints
- ✅ **Request Capture** - Capture any HTTP method, headers, body
- ✅ **Custom Response** - Configure status codes, headers, response body
- ✅ **Real-time Viewer** - WebSocket-based live request updates
- ✅ **Request Filtering/Search** - Filter by method, search headers/body
- ✅ **Request Forwarding** - Forward webhooks to other URLs
- ✅ **Rate Limiting** - Protect endpoints from abuse
- ✅ **Request Replay** - Re-send captured requests
- ✅ **Export** - Download requests as JSON/CSV/cURL
- ✅ **Request History Limits** - Auto-cleanup old requests

## Project Management

- **PRDs** → Product requirements in `.opencode/prds/`
- **Epics** → Implementation plans in `.opencode/epics/`
- **Tasks** → Tracked as GitHub issues
- **Agents** → Parallel execution via Git worktrees

### Quick Commands

```bash
# Create a new feature PRD
/pm:prd-new feature-name

# Convert PRD to implementation epic
/pm:prd-parse feature-name

# Break epic into tasks and sync to GitHub
/pm:epic-oneshot feature-name

# Start working on a task
/pm:issue-start <issue-number>

# Check project status
/pm:status
```

## Development Setup

Coming soon...

## Architecture

**Single Binary Deployment** - Frontend embedded in Rust executable for easy self-hosting.

**Database Schema:**

- `endpoints` - Webhook endpoint configurations
- `requests` - Captured webhook requests with full metadata

## License

MIT

---

Built with [OpenCode](https://opencode.ai)
