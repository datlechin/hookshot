# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-31

**Initial Release** 🎉

### Core Features

#### Webhook Endpoints
- ✅ Auto-generated UUID webhook endpoints
- ✅ Create, list, view, and delete endpoints via REST API
- ✅ Capture ALL HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD, etc.)
- ✅ Full request capture: headers, query parameters, body, IP address, timestamps
- ✅ Custom response configuration per endpoint (status code, headers, body)

#### Request Management
- ✅ Paginated request listing (configurable page size)
- ✅ Filter requests by HTTP method (single or multiple methods)
- ✅ Search through request headers and body content
- ✅ View individual request details
- ✅ Request count tracking per endpoint

#### Real-time Updates
- ✅ WebSocket support for live request updates
- ✅ Automatic UI refresh when new requests arrive
- ✅ Heartbeat mechanism to maintain connections

#### Data Export
- ✅ Export requests as JSON
- ✅ Export requests as CSV
- ✅ Generate cURL commands from requests
- ✅ One-click copy for webhook URLs

### User Interface

#### React Frontend
- ✅ Modern, responsive UI with React 19 and TypeScript
- ✅ Virtual scrolling for efficient handling of thousands of requests
- ✅ Tabbed detail view (Overview, Headers, Body, Metadata)
- ✅ Syntax highlighting for JSON, XML, and code
- ✅ Method badges with color coding
- ✅ Relative timestamps ("2 minutes ago")
- ✅ Keyboard shortcuts for navigation
- ✅ Copy buttons throughout the UI
- ✅ Empty states with helpful instructions
- ✅ Loading skeletons for better UX

#### Components
- ✅ Endpoint list with real-time updates
- ✅ Request filters (by method)
- ✅ Request search
- ✅ Detail panel with formatted content
- ✅ Custom response configuration modal
- ✅ Confirmation dialogs for destructive actions

### Backend Infrastructure

#### Technology Stack
- ✅ **Rust** - Memory-safe systems programming
- ✅ **Axum 0.8** - Modern async web framework
- ✅ **SQLite** - Embedded database with WAL mode
- ✅ **SQLx 0.8** - Async SQL with compile-time checking
- ✅ **Tower HTTP** - Middleware for CORS, compression, tracing
- ✅ **Tokio** - Async runtime

#### API Endpoints
- ✅ `GET /health` - Health check
- ✅ `POST /api/endpoints` - Create endpoint
- ✅ `GET /api/endpoints` - List endpoints
- ✅ `GET /api/endpoints/:id` - Get endpoint details
- ✅ `DELETE /api/endpoints/:id` - Delete endpoint
- ✅ `PUT /api/endpoints/:id/response` - Update custom response
- ✅ `GET /api/endpoints/:id/requests` - List requests (paginated, filtered)
- ✅ `GET /api/requests/:id` - Get request details
- ✅ `ANY /webhook/:id` - Webhook capture (all methods)
- ✅ `WS /ws/endpoints/:id` - WebSocket connection

#### Database
- ✅ SQLite with WAL mode for concurrent access
- ✅ Automatic migrations on startup
- ✅ Indexed queries for performance
- ✅ Foreign key constraints with CASCADE delete

### Developer Experience

#### Installation
- ✅ One-line installer for macOS and Linux
- ✅ Pre-built binaries for 5 platforms:
  - macOS Intel (x86_64)
  - macOS Apple Silicon (ARM64)
  - Linux x86_64
  - Linux ARM64
  - Windows x86_64
- ✅ SHA256 checksums for verification
- ✅ Single binary with embedded frontend (~7.5MB)
- ✅ Zero external dependencies

#### Configuration
- ✅ CLI arguments with clap:
  - `--host` / `-H` - Bind address
  - `--port` / `-p` - Port number
  - `--database-url` / `-d` - Database location
  - `--version` / `-V` - Show version
  - `--help` / `-h` - Show help
- ✅ Environment variables support
- ✅ Sensible defaults (localhost:3000, sqlite:./hookshot.db)

#### Build System
- ✅ Automatic frontend build via `build.rs`
- ✅ Frontend dist detection (skip rebuild if exists)
- ✅ Cross-platform npm command support (npm.cmd on Windows)
- ✅ Frontend embedding using `include_dir!` macro
- ✅ MIME type detection for static files
- ✅ Gzip compression for responses

#### CI/CD
- ✅ GitHub Actions for CI (tests, linting, builds)
- ✅ Multi-platform builds (Ubuntu, macOS, Windows)
- ✅ Security audit with cargo-audit
- ✅ Frontend tests with Vitest
- ✅ Backend tests with cargo test
- ✅ Accessibility tests with axe-core
- ✅ TypeScript type checking
- ✅ Code formatting validation (cargo fmt, prettier)
- ✅ Linting (clippy, eslint)

#### Release Automation
- ✅ Automated changelog generation from commits
- ✅ Conventional commit support (feat:, fix:, docs:, etc.)
- ✅ GitHub Releases with all platform binaries
- ✅ Automatic binary naming and versioning
- ✅ SHA256 checksum generation
- ✅ Professional release notes template
- ✅ Latest tag auto-update

### Technical Details

**Backend:**
- Rust 1.70+
- Axum 0.8 (async web framework)
- SQLite with SQLx migrations
- WebSocket support
- CORS enabled
- Request tracing
- Gzip compression

**Frontend:**
- React 19
- TypeScript 5.3+
- Vite 6.0 (build tool)
- Tailwind CSS 3.4
- Lucide React (icons)
- TanStack Virtual (list virtualization)
- React Syntax Highlighter

**Database Schema:**
- `endpoints` table (id, created_at, custom_response_*, request_count)
- `requests` table (id, endpoint_id, method, path, query_string, headers, body, content_type, received_at, ip_address)
- Indexed on endpoint_id, received_at, method for fast queries

### Documentation
- ✅ Comprehensive README with real examples
- ✅ API reference with all endpoints
- ✅ Installation guide (one-line installer)
- ✅ Configuration documentation
- ✅ Development setup guide
- ✅ Contributing guidelines with commit conventions
- ✅ Release guide for maintainers
- ✅ Changelog automation configuration

### Known Limitations

The following features are **planned** but not yet implemented:
- ❌ Request forwarding to external URLs
- ❌ Rate limiting per endpoint
- ❌ Auto-cleanup of old requests
- ❌ Request replay functionality
- ❌ Bulk operations
- ❌ Dark mode
- ❌ Request diff/comparison
- ❌ Webhook authentication
- ❌ Docker image

See the [Roadmap](README.md#-roadmap) for planned features.

---

**Full Release**: https://github.com/datlechin/hookshot/releases/tag/v0.1.0

[0.1.0]: https://github.com/datlechin/hookshot/releases/tag/v0.1.0
