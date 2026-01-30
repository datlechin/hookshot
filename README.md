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

### Prerequisites

- Rust 1.70+ (install from [rustup.rs](https://rustup.rs))
- Node.js 18+ and npm
- SQLite3 (optional, for manual database inspection)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/hookshot.git
cd hookshot

# Build and run (development mode)
cargo run

# In another terminal, run the frontend dev server
cd frontend
npm install
npm run dev
```

The backend runs on `http://localhost:3000` and the frontend dev server proxies API/WebSocket requests to it.

### Production Build

Build a single binary with embedded frontend:

```bash
# Build release binary (automatically builds frontend first)
cargo build --release

# Run the binary
./target/release/hookshot

# Or with custom database location
DATABASE_URL=sqlite:./data/hookshot.db ./target/release/hookshot
```

The release build:
- Automatically builds the frontend via `build.rs`
- Embeds all static files into the binary
- Produces a ~7.5MB executable with no external dependencies
- Serves both API and frontend from a single port (3000)

### Environment Variables

- `DATABASE_URL` - SQLite database path (default: `sqlite:./hookshot.db`)
- `RUST_LOG` - Logging level (default: `hookshot=debug,tower_http=debug`)
- `FORCE_FRONTEND_BUILD` - Force frontend build in dev mode (set to `1`)

### Manual Frontend Build

If you need to rebuild the frontend separately:

```bash
cd frontend
npm run build
```

The build output goes to `frontend/dist/` and will be embedded on next Rust build.

## Architecture

**Single Binary Deployment** - Frontend embedded in Rust executable for easy self-hosting.

**Database Schema:**

- `endpoints` - Webhook endpoint configurations
- `requests` - Captured webhook requests with full metadata

## License

MIT

---

Built with [OpenCode](https://opencode.ai)
