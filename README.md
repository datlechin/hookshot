# Hookshot 🎯

A self-hosted webhook testing tool built with Rust and React - like webhook.site but with no paid limits.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Rust](https://img.shields.io/badge/rust-1.70%2B-orange.svg)
![Build Status](https://img.shields.io/github/actions/workflow/status/datlechin/hookshot/ci.yml?branch=main)

## Features

- ✅ **Auto-generated Webhook Endpoints** - Create unique UUID endpoints instantly
- ✅ **Full Request Capture** - Capture any HTTP method, headers, query params, and body
- ✅ **Custom Responses** - Configure status codes, headers, and response body per endpoint
- ✅ **Real-time Updates** - WebSocket-based live request viewer
- ✅ **Request Filtering** - Filter by HTTP method, search in headers/body
- ✅ **Request Forwarding** - Forward incoming webhooks to other URLs
- ✅ **Rate Limiting** - Protect endpoints from abuse
- ✅ **Request Replay** - Re-send captured requests to test endpoints
- ✅ **Export** - Download requests as JSON, CSV, or cURL commands
- ✅ **Auto-cleanup** - Configurable request history limits
- ✅ **Single Binary** - No external dependencies, just download and run
- ✅ **Self-hosted** - Complete control over your data

## Quick Start

### One-line Install (macOS / Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/datlechin/hookshot/main/install.sh | sh
```

Then run:
```bash
hookshot
```

### Manual Install

1. Download the latest release for your platform from [Releases](https://github.com/datlechin/hookshot/releases)

2. Extract and run the binary:
   ```bash
   # macOS / Linux
   tar -xzf hookshot-*.tar.gz
   chmod +x hookshot-*
   ./hookshot-*

   # Windows
   # Extract the ZIP file and run hookshot-*.exe
   ```

3. Open your browser to `http://localhost:3000`

That's it! No database setup, no configuration files needed.

## Usage Examples

### Create a Webhook Endpoint

```bash
# Create a new endpoint
curl -X POST http://localhost:3000/api/endpoints
```

Response:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2024-01-30T10:00:00Z",
  "custom_response_enabled": false,
  "response_status": 200,
  "response_headers": "{}",
  "response_body": null,
  "forward_url": null,
  "max_requests": null,
  "rate_limit_per_minute": null
}
```

### Send a Test Webhook

```bash
# Send a webhook to your endpoint
curl -X POST http://localhost:3000/webhook/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -H "X-Custom-Header: test-value" \
  -d '{"event": "user.created", "user_id": 123}'
```

### Configure Custom Response

```bash
# Configure endpoint to return custom response
curl -X PUT http://localhost:3000/api/endpoints/a1b2c3d4-e5f6-7890-abcd-ef1234567890/response \
  -H "Content-Type: application/json" \
  -d '{
    "custom_response_enabled": true,
    "response_status": 201,
    "response_headers": "{\"X-Custom-Response\": \"created\"}",
    "response_body": "{\"status\": \"success\"}"
  }'
```

### View Captured Requests

```bash
# Get all requests for an endpoint
curl http://localhost:3000/api/endpoints/a1b2c3d4-e5f6-7890-abcd-ef1234567890/requests
```

### Real-time Updates via WebSocket

```javascript
// Connect to WebSocket for live updates
const ws = new WebSocket('ws://localhost:3000/ws/endpoints/a1b2c3d4-e5f6-7890-abcd-ef1234567890');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('New request:', message);
};
```

## Build from Source

### Prerequisites

- Rust 1.70+ ([install from rustup.rs](https://rustup.rs))
- Node.js 18+ and npm

### Development Build

```bash
# Clone the repository
git clone https://github.com/datlechin/hookshot.git
cd hookshot

# Run backend (will auto-compile)
cargo run

# In another terminal, run frontend dev server
cd frontend
npm install
npm run dev
```

The backend runs on `http://localhost:3000` and the frontend dev server on `http://localhost:5173` (proxied to backend).

### Production Build

```bash
# Build release binary (automatically builds and embeds frontend)
cargo build --release

# Run the binary
./target/release/hookshot
```

The release build:
- Automatically builds the frontend via `build.rs`
- Embeds all static files into the binary
- Produces a single ~7.5MB executable with no external dependencies
- Serves both API and frontend from port 3000

## Configuration

### Command-line Options

```bash
hookshot --help
```

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--host` | `-H` | `127.0.0.1` | Host address to bind to |
| `--port` | `-p` | `3000` | Port to listen on |
| `--database-url` | `-d` | `sqlite:./hookshot.db` | SQLite database file path |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:./hookshot.db` | SQLite database file path (overridden by `--database-url`) |
| `RUST_LOG` | `hookshot=debug,tower_http=debug` | Logging level |
| `FORCE_FRONTEND_BUILD` | (unset) | Force frontend rebuild in dev mode (set to `1`) |
| `SKIP_FRONTEND_BUILD` | (unset) | Skip frontend build entirely (set to `1`) |

### Examples

```bash
# Use custom port
hookshot --port 8080

# Bind to all interfaces
hookshot --host 0.0.0.0 --port 3000

# Use custom database location
hookshot --database-url sqlite:./data/webhooks.db

# Or with environment variable
DATABASE_URL=sqlite:./data/webhooks.db hookshot

# Enable verbose logging
RUST_LOG=debug hookshot

# Minimal logging
RUST_LOG=info hookshot
```

## Architecture

Hookshot is built as a modern, high-performance single binary application:

**Backend:**
- **Rust** - Memory-safe, blazing fast
- **Axum** - Modern async web framework
- **SQLite** - Zero-configuration embedded database
- **WebSocket** - Real-time bidirectional communication

**Frontend:**
- **React** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **shadcn/ui** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first styling

**Database Schema:**
- `endpoints` - Webhook endpoint configurations
- `requests` - Captured HTTP requests with full metadata

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## API Reference

### Endpoints

- `POST /api/endpoints` - Create new webhook endpoint
- `GET /api/endpoints` - List all endpoints
- `DELETE /api/endpoints/:id` - Delete endpoint
- `PUT /api/endpoints/:id/response` - Configure custom response

### Requests

- `GET /api/endpoints/:id/requests` - Get all requests for endpoint
- `GET /api/requests/:id` - Get specific request details

### Webhooks

- `ANY /webhook/:id` - Webhook capture endpoint (accepts all HTTP methods)

### WebSocket

- `WS /ws/endpoints/:id` - Real-time updates for endpoint

## Development

### Run Tests

```bash
# Run all tests
cargo test

# Run with output
cargo test -- --nocapture
```

### Manual Frontend Build

```bash
cd frontend
npm run build
```

### Database Migrations

Migrations are automatically applied on startup. Manual migration:

```bash
sqlx migrate run --database-url sqlite:./hookshot.db
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

---

Built with [Claude Code PM](https://github.com/automazeio/ccpm)
