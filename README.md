# Hookshot 🎯

**Self-hosted webhook testing and debugging tool** - Inspect, test, and debug webhooks with ease.

> Like webhook.site, but completely self-hosted with no limits, no tracking, and full control over your data.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/rust-1.70%2B-orange.svg)](https://www.rust-lang.org)
[![Build Status](https://img.shields.io/github/actions/workflow/status/datlechin/hookshot/ci.yml?branch=main)](https://github.com/datlechin/hookshot/actions)
[![GitHub release](https://img.shields.io/github/v/release/datlechin/hookshot)](https://github.com/datlechin/hookshot/releases)

---

## ✨ Features

### Core Functionality
- 🎯 **Unique Webhook URLs** - Instantly generate UUID-based webhook endpoints
- 📨 **Full Request Capture** - Capture ALL HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
- 📋 **Complete Request Details** - Headers, query parameters, body, IP address, timestamps
- 🔄 **Real-time Updates** - Live WebSocket connection shows requests as they arrive
- 🎨 **Beautiful UI** - Modern, responsive interface built with React and Tailwind CSS

### Request Management
- 🔍 **Advanced Filtering** - Filter requests by HTTP method
- 🔎 **Search** - Search through request headers and body content
- 📄 **Pagination** - Efficient handling of large request histories
- ⚡ **Virtual Scrolling** - Smooth performance with thousands of requests
- 📊 **Request Details** - Tabbed interface for Overview, Headers, Body, and Metadata

### Developer Experience
- 💾 **Export Options** - Download requests as JSON, CSV, or cURL commands
- 📋 **One-Click Copy** - Copy webhook URLs, request data, cURL commands
- ⌨️ **Keyboard Shortcuts** - Navigate efficiently with keyboard controls
- 🕐 **Relative Timestamps** - Human-friendly time display (e.g., "2 minutes ago")
- 🎨 **Syntax Highlighting** - Pretty-print JSON, XML, and other formats

### Custom Responses
- ⚙️ **Configurable Responses** - Set custom HTTP status codes
- 📤 **Custom Headers** - Return any headers you want
- 💬 **Custom Body** - Send back specific response content
- 🔧 **Per-Endpoint Config** - Each webhook can have its own response settings

### Technical Excellence
- 🚀 **Single Binary** - No dependencies, no setup - just download and run
- 🗄️ **SQLite Database** - Embedded database with WAL mode for concurrent access
- 🌐 **WebSocket Support** - Real-time bidirectional communication
- 🔒 **CORS Enabled** - Works with any frontend or API client
- 📦 **Embedded Frontend** - Complete web UI bundled in ~7.5MB binary
- ⚡ **High Performance** - Built with Rust and Axum for blazing speed
- 🐳 **Self-hosted** - Complete privacy and control over your data

---

## 🚀 Quick Start

### One-Line Install (macOS/Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/datlechin/hookshot/main/install.sh | sh
```

Then run:
```bash
hookshot
```

### Manual Download

1. Download the latest release for your platform:
   - [macOS (Intel)](https://github.com/datlechin/hookshot/releases/latest) - `macos-x86_64.tar.gz`
   - [macOS (Apple Silicon)](https://github.com/datlechin/hookshot/releases/latest) - `macos-arm64.tar.gz`
   - [Linux (x86_64)](https://github.com/datlechin/hookshot/releases/latest) - `linux-x86_64.tar.gz`
   - [Linux (ARM64)](https://github.com/datlechin/hookshot/releases/latest) - `linux-arm64.tar.gz`
   - [Windows (x86_64)](https://github.com/datlechin/hookshot/releases/latest) - `windows-x86_64.zip`

2. Extract and run:
   ```bash
   # macOS/Linux
   tar -xzf hookshot-*.tar.gz
   chmod +x hookshot-*
   ./hookshot-*

   # Windows
   # Extract ZIP and run hookshot-*.exe
   ```

3. Open your browser to **http://localhost:3000**

That's it! No database setup, no config files - just run and go.

---

## 💡 Usage

### Creating Your First Webhook

1. **Open Hookshot** in your browser (`http://localhost:3000`)
2. **Click "New Endpoint"** - A unique webhook URL is generated instantly
3. **Copy the webhook URL** - Use it in your applications or services
4. **Send a test request**:
   ```bash
   curl -X POST http://localhost:3000/webhook/YOUR-ENDPOINT-ID \
     -H "Content-Type: application/json" \
     -d '{"event": "test", "message": "Hello Hookshot!"}'
   ```
5. **Watch it appear** in real-time in the Hookshot UI!

### Filtering and Searching Requests

- **Filter by method**: Click method badges (GET, POST, etc.) to filter
- **Search content**: Use the search bar to find requests containing specific text
- **View details**: Click any request to see headers, body, and metadata
- **Export**: Use the export menu to download as JSON, CSV, or cURL

### Configuring Custom Responses

1. Click the ⚙️ icon next to your endpoint
2. Toggle "Enable Custom Response"
3. Set your desired:
   - **Status Code** (e.g., `200`, `201`, `404`)
   - **Headers** (JSON format: `{"X-Custom": "value"}`)
   - **Response Body** (any text or JSON)
4. Save and test!

Now when webhooks hit your endpoint, they'll receive your custom response.

### Using the API

Hookshot provides a full REST API for automation:

```bash
# Create a new endpoint
curl -X POST http://localhost:3000/api/endpoints

# List all endpoints
curl http://localhost:3000/api/endpoints

# Get requests for an endpoint
curl "http://localhost:3000/api/endpoints/YOUR-ID/requests?page=1&limit=50"

# Filter by method
curl "http://localhost:3000/api/endpoints/YOUR-ID/requests?method=POST,PUT"

# Configure custom response
curl -X PUT http://localhost:3000/api/endpoints/YOUR-ID/response \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "status": 201,
    "headers": "{\"X-Custom\": \"header\"}",
    "body": "{\"status\": \"success\"}"
  }'

# Delete an endpoint
curl -X DELETE http://localhost:3000/api/endpoints/YOUR-ID
```

### Real-time Updates via WebSocket

```javascript
const ws = new WebSocket('ws://localhost:3000/ws/endpoints/YOUR-ENDPOINT-ID');

ws.onopen = () => {
  console.log('Connected to webhook endpoint');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'new_request') {
    console.log('New webhook received:', data.request);
  }
};

ws.onclose = () => {
  console.log('Disconnected');
};
```

---

## ⚙️ Configuration

### Command-Line Options

```bash
hookshot --help
```

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--host` | `-H` | `127.0.0.1` | Host address to bind to |
| `--port` | `-p` | `3000` | Port to listen on |
| `--database-url` | `-d` | `sqlite:./hookshot.db` | SQLite database path |
| `--version` | `-V` | - | Print version information |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:./hookshot.db` | Database file location |
| `RUST_LOG` | `hookshot=debug` | Logging level (`debug`, `info`, `warn`, `error`) |

### Examples

```bash
# Run on a different port
hookshot --port 8080

# Bind to all network interfaces
hookshot --host 0.0.0.0 --port 3000

# Use custom database location
hookshot --database-url sqlite:./data/webhooks.db

# Minimal logging
RUST_LOG=info hookshot

# Verbose debug logging
RUST_LOG=debug hookshot
```

---

## 🏗️ Architecture

Hookshot is built as a high-performance, single-binary application:

### Backend Stack
- **[Rust](https://www.rust-lang.org/)** - Memory-safe systems programming language
- **[Axum](https://github.com/tokio-rs/axum)** - Ergonomic web framework built on Tokio
- **[SQLite](https://www.sqlite.org/)** - Zero-configuration embedded database with WAL mode
- **[SQLx](https://github.com/launchbadge/sqlx)** - Async SQL toolkit with compile-time query checking
- **[WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)** - Real-time bidirectional communication
- **[Tower](https://github.com/tower-rs/tower)** - Middleware for CORS, compression, and tracing

### Frontend Stack
- **[React 19](https://react.dev/)** - Modern UI library with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful, consistent icon library
- **[TanStack Virtual](https://tanstack.com/virtual)** - Headless UI for virtualizing large lists
- **[React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)** - Code syntax highlighting

### Database Schema

```sql
-- Endpoints table
endpoints (
  id TEXT PRIMARY KEY,              -- UUID v4
  created_at TIMESTAMP,             -- Creation time
  custom_response_enabled BOOLEAN,  -- Enable custom response
  response_status INTEGER,          -- HTTP status code
  response_headers TEXT,            -- JSON string of headers
  response_body TEXT,               -- Custom response body
  request_count INTEGER             -- Total requests received
)

-- Requests table
requests (
  id INTEGER PRIMARY KEY,           -- Auto-increment
  endpoint_id TEXT,                 -- Foreign key to endpoints
  method TEXT,                      -- HTTP method (GET, POST, etc.)
  path TEXT,                        -- Request path
  query_string TEXT,                -- Raw query string
  headers TEXT,                     -- JSON string of headers
  body BLOB,                        -- Raw request body (binary)
  content_type TEXT,                -- Content-Type header
  received_at TIMESTAMP,            -- When request was received
  ip_address TEXT                   -- Client IP address
)
```

### Build Process

The project uses a custom `build.rs` script that:
1. Checks if `frontend/dist` exists
2. If not in release mode, skips frontend build
3. In release mode, builds the frontend with Vite
4. Embeds all static files into the Rust binary using `include_dir!`
5. Produces a single executable with zero external dependencies

---

## 🛠️ Development

### Prerequisites

- **Rust 1.70+** - Install from [rustup.rs](https://rustup.rs)
- **Node.js 18+** - Install from [nodejs.org](https://nodejs.org)
- **npm** - Comes with Node.js

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/datlechin/hookshot.git
cd hookshot

# Run backend (dev mode - no frontend build required)
cargo run

# In another terminal, run frontend dev server
cd frontend
npm install
npm run dev
```

The backend runs on `http://localhost:3000`
The frontend dev server runs on `http://localhost:5173` (proxied to backend)

### Running Tests

```bash
# Backend tests
cargo test

# Backend tests with output
cargo test -- --nocapture

# Frontend tests
cd frontend
npm test

# Frontend tests with UI
npm run test:ui

# Test coverage
npm run test:coverage
```

### Code Quality

```bash
# Format Rust code
cargo fmt

# Lint Rust code
cargo clippy --all-features -- -D warnings

# Format frontend code
cd frontend
npm run format

# Lint frontend code
npm run lint

# TypeScript type checking
npm run ci:typecheck
```

### Production Build

```bash
# Build release binary (automatically builds and embeds frontend)
cargo build --release

# Binary will be at: ./target/release/hookshot
./target/release/hookshot
```

The release build:
- Automatically builds the frontend via `build.rs`
- Embeds all static files into the binary
- Produces a single ~7.5MB executable
- No external dependencies required
- Serves both API and frontend from port 3000

---

## 📚 API Reference

### Health Check

```
GET /health
```

Returns server health status.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/endpoints` | Create a new webhook endpoint |
| `GET` | `/api/endpoints` | List all endpoints |
| `GET` | `/api/endpoints/:id` | Get endpoint details |
| `DELETE` | `/api/endpoints/:id` | Delete an endpoint |
| `PUT` | `/api/endpoints/:id/response` | Update custom response config |

### Requests

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/endpoints/:id/requests` | Get requests for endpoint (paginated) |
| `GET` | `/api/requests/:id` | Get specific request details |

**Query Parameters for `/api/endpoints/:id/requests`:**
- `page` (default: 1) - Page number
- `limit` (default: 50) - Results per page
- `method` (optional) - Comma-separated HTTP methods to filter (e.g., `POST,PUT`)

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| `ANY` | `/webhook/:id` | Webhook capture endpoint (accepts ALL HTTP methods) |

This endpoint:
- Accepts any HTTP method (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD, etc.)
- Captures complete request details (headers, body, query params, IP)
- Stores in database and broadcasts via WebSocket
- Returns custom response if configured, otherwise returns 200 OK

### WebSocket

| Method | Path | Description |
|--------|------|-------------|
| `WS` | `/ws/endpoints/:id` | Real-time updates for an endpoint |

**WebSocket Message Format:**
```json
{
  "type": "new_request",
  "request": {
    "id": 123,
    "method": "POST",
    "headers": {},
    "body": "...",
    "received_at": "2024-01-30T10:00:00Z"
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Commit message conventions (for automatic changelog generation)
- Pull request process
- Testing requirements

**Quick Start for Contributors:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes following our conventions
4. Write tests for your changes
5. Commit with conventional commits (`feat: Add amazing feature`)
6. Push and create a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🗺️ Roadmap

### Planned Features
- [ ] Request forwarding to external URLs
- [ ] Rate limiting per endpoint
- [ ] Auto-cleanup of old requests (configurable retention)
- [ ] Request replay functionality
- [ ] Bulk operations (delete multiple requests)
- [ ] Export endpoint configurations
- [ ] Import/export endpoint data
- [ ] Custom request/response transformations
- [ ] Webhook authentication (API keys, signatures)
- [ ] Docker image for easy deployment
- [ ] Prometheus metrics endpoint
- [ ] Request diff/comparison view

See [GitHub Issues](https://github.com/datlechin/hookshot/issues) for feature requests and bug reports.

---

## 🙏 Acknowledgments

- Built with [Claude Code PM](https://github.com/automazeio/ccpm) - AI-powered project management
- Inspired by [webhook.site](https://webhook.site) and [requestbin](https://requestbin.com)
- Icons by [Lucide](https://lucide.dev)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com)

---

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/datlechin/hookshot/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/datlechin/hookshot/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/datlechin/hookshot/discussions)

---

## ⭐ Star History

If you find Hookshot useful, please consider giving it a star on GitHub! ⭐

---

**Built with 🦀 Rust and ⚛️ React** • **Made with ❤️ for developers**
