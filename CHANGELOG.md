# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-30

### Added

#### Backend Features
- Auto-generated UUID webhook endpoints
- Full HTTP request capture (all methods, headers, query params, body)
- Custom response configuration per endpoint (status, headers, body)
- Request forwarding to external URLs
- Rate limiting per endpoint
- Request history limits with auto-cleanup
- SQLite database with automatic migrations
- WebSocket server for real-time updates
- RESTful API for endpoint and request management
- Static file serving with embedded frontend
- Health check endpoint
- Comprehensive logging with tracing
- CORS support for all origins

#### Frontend Features
- React + TypeScript + Vite application
- Dashboard showing all webhook endpoints
- Real-time request viewer via WebSocket
- Request detail view with formatted JSON/headers
- Custom response configuration UI
- Request filtering by HTTP method
- Request search in headers and body
- Request export (JSON, CSV, cURL)
- Request replay functionality
- Endpoint deletion
- Beautiful UI with shadcn/ui components
- Responsive design with Tailwind CSS
- Dark mode support

#### Developer Experience
- Single binary deployment with embedded frontend
- Automatic frontend build via build.rs
- Zero external dependencies
- Simple SQLite database (no setup required)
- Environment variable configuration
- Cross-platform support (macOS, Linux, Windows)

### Technical Details
- **Backend**: Rust + Axum + SQLite + SQLx
- **Frontend**: React + TypeScript + Vite + shadcn/ui + Tailwind
- **Database**: SQLite with SQLx migrations
- **Real-time**: WebSocket for live updates
- **Deployment**: Single binary (~7.5MB) with embedded static files

[0.1.0]: https://github.com/datlechin/hookshot/releases/tag/v0.1.0
