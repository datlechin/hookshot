---
name: hookshot-mvp
description: Self-hosted webhook testing tool MVP with real-time capture, custom responses, and zero request limits
status: backlog
created: 2026-01-29T09:12:21Z
---

# PRD: Hookshot MVP

## Executive Summary

Hookshot is a self-hosted webhook testing and debugging tool designed to replace webhook.site for developers, QA teams, and DevOps engineers who need privacy, unlimited requests, and local control. The MVP delivers core functionality to capture, inspect, and respond to webhooks in real-time with zero external dependencies.

**Value Proposition:**
- 🔒 **Privacy-First**: Self-hosted - your webhook data never leaves your infrastructure
- 🚀 **Unlimited**: No request caps, no rate limits, no paid tiers
- ⚡ **Real-Time**: WebSocket-powered live updates as webhooks arrive
- 🎯 **Simple**: Single binary deployment, SQLite storage, zero configuration
- 🛠️ **Powerful**: Custom responses, filtering, and search capabilities

**Target Release:** 2-3 weeks from kickoff

## Problem Statement

### What problem are we solving?

**Current Pain Points with webhook.site:**
1. **Privacy Concerns**: Sensitive webhook data (API keys, PII, payment data) sent to third-party servers
2. **Request Limits**: Free tier caps at 500 requests/month, paid plans expensive for teams
3. **Offline Unavailable**: Cannot test webhooks without internet connection
4. **Data Retention**: Limited history, no control over retention policies
5. **Corporate Restrictions**: Many enterprises block webhook.site for security reasons
6. **Performance**: Network latency to external service slows development workflows

### Why is this important now?

- **Webhook Adoption Growing**: 73% of SaaS apps now use webhooks (2025 data)
- **Security Requirements Tightening**: GDPR, SOC2, HIPAA compliance require data locality
- **Remote Development**: Teams need reliable local testing without cloud dependencies
- **DevOps Automation**: CI/CD pipelines need repeatable webhook testing environments
- **Cost Pressure**: Teams spending $50-200/month on webhook.site alternatives

### Target Users

**Primary Personas:**

1. **Backend Developer (Dev)** - 40% of users
   - Testing webhook integrations during local development
   - Debugging webhook payloads from third-party APIs (Stripe, GitHub, etc.)
   - Needs: Fast setup, real-time inspection, custom responses

2. **QA Engineer (Test)** - 35% of users
   - Validating webhook retry logic and error handling
   - Testing edge cases (malformed payloads, timeouts, specific status codes)
   - Needs: Reproducibility, custom responses, request filtering

3. **DevOps/Platform Engineer (Ops)** - 25% of users
   - Debugging production webhook issues in staging environments
   - Setting up webhook testing infrastructure for teams
   - Needs: Self-hosted, reliable, scalable, simple deployment

## User Stories

### Epic 1: Webhook Endpoint Management

**US-1.1: Generate Unique Webhook Endpoint**
- **As a** developer
- **I want to** instantly create a unique webhook URL
- **So that** I can start receiving webhooks without configuration

**Acceptance Criteria:**
- [ ] Click "New Endpoint" generates UUID endpoint immediately
- [ ] Endpoint URL format: `http://localhost:3000/webhook/{uuid}`
- [ ] UUID is cryptographically random (UUID v4)
- [ ] Endpoint is immediately active and ready to receive requests
- [ ] Endpoint URL is copyable with one click

**US-1.2: View All My Endpoints**
- **As a** user
- **I want to** see a list of all my webhook endpoints
- **So that** I can manage multiple webhook integrations

**Acceptance Criteria:**
- [ ] Dashboard shows all created endpoints with UUIDs
- [ ] Display creation timestamp for each endpoint
- [ ] Show request count per endpoint
- [ ] Support searching/filtering endpoints
- [ ] Show endpoint status (active/inactive)

### Epic 2: Request Capture & Storage

**US-2.1: Capture All HTTP Request Details**
- **As a** developer
- **I want** all webhook requests captured with complete details
- **So that** I can inspect exactly what was sent

**Acceptance Criteria:**
- [ ] Capture: HTTP method, path, query string, headers, body, IP address
- [ ] Support all HTTP methods (GET, POST, PUT, PATCH, DELETE, etc.)
- [ ] Store binary bodies (multipart/form-data, images, etc.)
- [ ] Preserve original Content-Type
- [ ] Record precise timestamp (millisecond accuracy)
- [ ] Handle requests up to 10MB body size
- [ ] Capture fails gracefully for oversized requests (>10MB)

**US-2.2: Persist Requests to Database**
- **As a** user
- **I want** webhook requests saved to SQLite
- **So that** I can review them later and across restarts

**Acceptance Criteria:**
- [ ] SQLite database created automatically on first run
- [ ] Requests persist across application restarts
- [ ] Database stored in configurable location (default: `./hookshot.db`)
- [ ] Efficient indexing on endpoint_id and received_at
- [ ] Support minimum 10,000 requests without performance degradation

### Epic 3: Real-Time Request Viewer

**US-3.1: See Requests Instantly via WebSocket**
- **As a** developer
- **I want** requests to appear in the UI immediately
- **So that** I can see webhooks as they arrive without refreshing

**Acceptance Criteria:**
- [ ] WebSocket connection established on page load
- [ ] New requests appear in UI within 100ms of receipt
- [ ] Updates are scoped to specific endpoint (only see my endpoint's requests)
- [ ] Handle WebSocket reconnection on connection loss
- [ ] Visual notification when new request arrives

**US-3.2: Browse Request History**
- **As a** user
- **I want to** scroll through past requests
- **So that** I can compare multiple webhook deliveries

**Acceptance Criteria:**
- [ ] Display requests in reverse chronological order (newest first)
- [ ] Paginated view (50 requests per page)
- [ ] Infinite scroll or "Load More" for older requests
- [ ] Show request metadata: timestamp, method, status, size
- [ ] Click request to view full details

**US-3.3: Inspect Request Details**
- **As a** developer
- **I want to** view complete request data in organized format
- **So that** I can quickly find specific headers or body content

**Acceptance Criteria:**
- [ ] Tabbed interface: Headers | Body | Raw
- [ ] Headers displayed as key-value table
- [ ] Body syntax-highlighted (JSON, XML, plain text)
- [ ] Raw view shows complete HTTP request
- [ ] Support copying headers, body, or full request
- [ ] Display formatted timestamps (relative + absolute)

### Epic 4: Custom Response Configuration

**US-4.1: Configure Custom Response**
- **As a** QA engineer
- **I want to** set custom HTTP responses for my endpoint
- **So that** I can test how my app handles different webhook responses

**Acceptance Criteria:**
- [ ] Toggle "Custom Response" on/off per endpoint
- [ ] Default response: 200 OK with empty body
- [ ] Configure: status code, headers (key-value pairs), response body
- [ ] Support all standard HTTP status codes (200, 201, 400, 404, 500, etc.)
- [ ] Validate status codes (must be 100-599)
- [ ] Preview response before saving
- [ ] Changes apply immediately to subsequent requests

**US-4.2: Test Different Response Scenarios**
- **As a** developer
- **I want** quick templates for common responses
- **So that** I can test error handling without manual configuration

**Acceptance Criteria:**
- [ ] Preset templates: Success (200), Created (201), Bad Request (400), Not Found (404), Server Error (500)
- [ ] Apply template with one click
- [ ] Templates are customizable after application
- [ ] Support JSON and plain text response bodies

### Epic 5: Request Filtering & Search

**US-5.1: Filter Requests by Method**
- **As a** user
- **I want to** filter requests by HTTP method
- **So that** I can focus on specific types of webhooks

**Acceptance Criteria:**
- [ ] Filter buttons: ALL, GET, POST, PUT, DELETE, PATCH
- [ ] Multi-select supported (show POST + PUT)
- [ ] Filter persists during session
- [ ] Show request count per method

**US-5.2: Search Request Content**
- **As a** developer
- **I want to** search within headers and body
- **So that** I can find specific webhook deliveries

**Acceptance Criteria:**
- [ ] Search box with real-time filtering
- [ ] Search across: headers (keys + values), body content
- [ ] Case-insensitive by default
- [ ] Highlight matching text in results
- [ ] Clear search with one click
- [ ] Show "No results" when no matches

## Requirements

### Functional Requirements

#### FR-1: Webhook Reception
- **FR-1.1**: Accept HTTP requests on `/webhook/{uuid}` endpoints
- **FR-1.2**: Support all standard HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- **FR-1.3**: Parse and store query parameters
- **FR-1.4**: Extract and store all HTTP headers
- **FR-1.5**: Read and store request body (up to 10MB)
- **FR-1.6**: Detect and store Content-Type
- **FR-1.7**: Record client IP address
- **FR-1.8**: Timestamp requests with millisecond precision

#### FR-2: Endpoint Management
- **FR-2.1**: Generate UUID v4 for new endpoints
- **FR-2.2**: List all created endpoints
- **FR-2.3**: Display endpoint metadata (created_at, request_count)
- **FR-2.4**: Delete endpoints (soft delete with confirmation)
- **FR-2.5**: Copy endpoint URL to clipboard

#### FR-3: Request Storage
- **FR-3.1**: Persist requests to SQLite database
- **FR-3.2**: Create database automatically on first run
- **FR-3.3**: Schema migrations for version upgrades
- **FR-3.4**: Support minimum 10,000 requests per endpoint
- **FR-3.5**: Efficient querying by endpoint_id and timestamp

#### FR-4: Real-Time Updates
- **FR-4.1**: WebSocket server for live request notifications
- **FR-4.2**: Subscribe to specific endpoint updates
- **FR-4.3**: Broadcast new requests to connected clients within 100ms
- **FR-4.4**: Handle WebSocket reconnection gracefully
- **FR-4.5**: Heartbeat/ping to detect stale connections

#### FR-5: Request Inspection
- **FR-5.1**: Display request list with pagination (50/page)
- **FR-5.2**: Show request metadata in list view
- **FR-5.3**: Detail view with headers, body, and raw tabs
- **FR-5.4**: Syntax highlighting for JSON/XML bodies
- **FR-5.5**: Copy to clipboard functionality for all data

#### FR-6: Custom Responses
- **FR-6.1**: Configure custom response per endpoint
- **FR-6.2**: Set HTTP status code (100-599)
- **FR-6.3**: Add custom response headers (key-value pairs)
- **FR-6.4**: Set response body (text/JSON)
- **FR-6.5**: Enable/disable custom response toggle
- **FR-6.6**: Response templates for common scenarios

#### FR-7: Filtering & Search
- **FR-7.1**: Filter requests by HTTP method
- **FR-7.2**: Multi-method filter support
- **FR-7.3**: Search within headers and body
- **FR-7.4**: Case-insensitive search
- **FR-7.5**: Highlight search matches

#### FR-8: Frontend UI
- **FR-8.1**: Dashboard with endpoint list
- **FR-8.2**: Endpoint detail view with request list
- **FR-8.3**: Request detail modal/panel
- **FR-8.4**: Responsive design (desktop + tablet)
- **FR-8.5**: Dark mode support (using shadcn/ui)

### Non-Functional Requirements

#### NFR-1: Performance
- **NFR-1.1**: Webhook response time < 50ms (P95)
- **NFR-1.2**: Real-time update latency < 100ms (P95)
- **NFR-1.3**: UI initial load time < 2 seconds
- **NFR-1.4**: Support 1,000 requests/minute per endpoint
- **NFR-1.5**: Handle 100+ concurrent endpoints
- **NFR-1.6**: Database queries < 100ms (P95)

#### NFR-2: Reliability
- **NFR-2.1**: 99.9% uptime for webhook capture (acceptable downtime: <1min/day)
- **NFR-2.2**: Zero data loss for captured requests
- **NFR-2.3**: Graceful degradation when database full
- **NFR-2.4**: Automatic WebSocket reconnection
- **NFR-2.5**: SQLite WAL mode for concurrent reads/writes

#### NFR-3: Scalability
- **NFR-3.1**: Support 10,000+ requests per endpoint without performance degradation
- **NFR-3.2**: Database size up to 10GB without issues
- **NFR-3.3**: Efficient pagination for large request lists
- **NFR-3.4**: Background cleanup of old data (configurable retention)

#### NFR-4: Security
- **NFR-4.1**: Bind to localhost by default (opt-in for network access)
- **NFR-4.2**: No external network calls (fully offline capable)
- **NFR-4.3**: SQL injection protection (parameterized queries via SQLx)
- **NFR-4.4**: XSS prevention in frontend (React auto-escaping)
- **NFR-4.5**: CORS headers configurable per endpoint

#### NFR-5: Usability
- **NFR-5.1**: Zero-configuration startup (just run the binary)
- **NFR-5.2**: Single command deployment
- **NFR-5.3**: Intuitive UI requiring no documentation
- **NFR-5.4**: Accessible UI (WCAG 2.1 AA via shadcn/ui)
- **NFR-5.5**: Clear error messages with remediation steps

#### NFR-6: Portability
- **NFR-6.1**: Cross-platform: macOS, Linux, Windows
- **NFR-6.2**: Single static binary (no runtime dependencies)
- **NFR-6.3**: Frontend embedded in binary (no separate build step)
- **NFR-6.4**: SQLite bundled (no external database required)

#### NFR-7: Maintainability
- **NFR-7.1**: Comprehensive error logging (structured logs)
- **NFR-7.2**: Database schema versioning and migrations
- **NFR-7.3**: Configuration via environment variables + config file
- **NFR-7.4**: Modular architecture (handlers, services, models)

## Success Criteria

### Launch Criteria (MVP Complete)
- [ ] Can create webhook endpoints in < 3 seconds
- [ ] Can capture 1,000 req/min without data loss
- [ ] Real-time updates arrive within 100ms
- [ ] Custom responses work for all status codes
- [ ] Search finds requests within 1 second
- [ ] Single binary runs on macOS/Linux/Windows
- [ ] Zero configuration required for first run
- [ ] UI renders correctly on desktop + tablet

### Key Metrics & KPIs

**Adoption Metrics:**
- 100+ GitHub stars within 1 month of launch
- 50+ active installations (self-reported + telemetry opt-in)
- 3+ community contributions (issues, PRs, discussions)

**Performance Metrics:**
- P95 webhook response time: < 50ms
- P95 real-time update latency: < 100ms
- P95 database query time: < 100ms
- Zero critical bugs in first 2 weeks

**Usability Metrics:**
- Time to first webhook: < 1 minute (from download to first captured request)
- User retention: 70% of users return within 7 days
- Feature adoption: 60% users configure custom responses

**Quality Metrics:**
- Code coverage: > 70% (Rust backend)
- Zero security vulnerabilities (cargo audit)
- Documentation completeness: 100% (README, API docs, deployment guide)

### User Satisfaction
- "Works as expected" rating > 90% (GitHub surveys)
- Average GitHub issue resolution time < 48 hours
- Net Promoter Score (NPS) > 50

## Technical Architecture

### System Components

**Backend (Rust + Axum):**
```
src/
├── main.rs              # Server initialization, routing
├── models/
│   ├── endpoint.rs      # Endpoint data model
│   └── request.rs       # Request data model
├── handlers/
│   ├── webhook.rs       # POST /webhook/{uuid} handler
│   ├── api.rs           # REST API for frontend
│   └── websocket.rs     # WebSocket connection handler
├── services/
│   ├── endpoint_service.rs   # Endpoint CRUD logic
│   └── request_service.rs    # Request capture & query
├── db/
│   ├── mod.rs           # Database connection pool
│   ├── migrations.rs    # Schema migrations
│   └── queries.rs       # SQLx queries
└── config.rs            # Configuration management
```

**Frontend (React + TypeScript + Vite):**
```
frontend/
├── src/
│   ├── main.tsx              # App entry
│   ├── App.tsx               # Router + layout
│   ├── lib/
│   │   ├── api.ts            # REST API client
│   │   └── websocket.ts      # WebSocket client
│   ├── hooks/
│   │   ├── useEndpoints.ts   # Endpoint management
│   │   ├── useRequests.ts    # Request fetching
│   │   └── useWebSocket.ts   # Real-time updates
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── EndpointList.tsx
│   │   ├── RequestList.tsx
│   │   ├── RequestDetail.tsx
│   │   └── ResponseConfig.tsx
│   └── pages/
│       ├── Dashboard.tsx     # Endpoint overview
│       └── EndpointView.tsx  # Single endpoint + requests
```

### Database Schema (SQLite)

**endpoints table:**
```sql
CREATE TABLE endpoints (
    id TEXT PRIMARY KEY,                    -- UUID v4
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    custom_response_enabled BOOLEAN DEFAULT FALSE,
    response_status INTEGER DEFAULT 200,
    response_headers TEXT,                  -- JSON
    response_body TEXT,
    request_count INTEGER DEFAULT 0
);
CREATE INDEX idx_endpoints_created ON endpoints(created_at DESC);
```

**requests table:**
```sql
CREATE TABLE requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    query_string TEXT,
    headers TEXT NOT NULL,                  -- JSON
    body BLOB,
    content_type TEXT,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE
);
CREATE INDEX idx_requests_endpoint_time ON requests(endpoint_id, received_at DESC);
CREATE INDEX idx_requests_method ON requests(endpoint_id, method);
```

### API Specification

**REST Endpoints:**
- `POST /api/endpoints` - Create new endpoint → `{ id: uuid }`
- `GET /api/endpoints` - List all endpoints → `[{ id, created_at, request_count }]`
- `DELETE /api/endpoints/:id` - Delete endpoint → `204 No Content`
- `GET /api/endpoints/:id/requests?page=1&limit=50&method=POST` - Get requests with filters
- `GET /api/requests/:id` - Get single request details
- `PUT /api/endpoints/:id/response` - Update custom response config

**WebSocket:**
- `ws://localhost:3000/ws/endpoints/:id` - Subscribe to endpoint updates
- Message format: `{ type: "new_request", data: { id, method, received_at, ... } }`

### Technology Stack

**Backend:**
- Rust 1.75+
- Axum 0.7 (web framework)
- SQLx 0.7 (database, compile-time query verification)
- Tokio (async runtime)
- Tower (middleware)
- Serde (JSON serialization)
- UUID (endpoint ID generation)

**Frontend:**
- React 18
- TypeScript 5
- Vite 5 (build tool)
- shadcn/ui + Radix UI (components)
- Tailwind CSS (styling)
- React Router (navigation)
- TanStack Query (data fetching)

**Deployment:**
- Single static binary (via `cargo build --release`)
- Frontend embedded using `include_dir!` macro
- SQLite bundled (rusqlite)

## Constraints & Assumptions

### Technical Constraints
- **TC-1**: SQLite maximum database size: 281 TB (effectively unlimited for MVP)
- **TC-2**: Single-threaded writes (SQLite limitation, mitigated with WAL mode)
- **TC-3**: Request body size limit: 10MB (Axum default, configurable)
- **TC-4**: WebSocket connection limit: ~10,000 (OS file descriptor limit)
- **TC-5**: Rust compilation time: 2-5 minutes (incremental builds faster)

### Resource Constraints
- **RC-1**: Solo developer + 1-2 contributors (open source)
- **RC-2**: No budget for external services (cloud, CDN, etc.)
- **RC-3**: Development time: 2-3 weeks part-time (~60-80 hours total)

### Assumptions
- **A-1**: Users have basic command-line knowledge
- **A-2**: Users run on x86_64 or ARM64 architecture
- **A-3**: Users have 100MB+ free disk space
- **A-4**: Network environment allows binding to localhost:3000
- **A-5**: Modern browser support (Chrome 100+, Firefox 100+, Safari 15+)
- **A-6**: Users do not need authentication (single-user mode)
- **A-7**: Users manage data retention manually (no automatic cleanup in MVP)
- **A-8**: Users accept SQLite limitations (not suitable for distributed deployments)

## Out of Scope (Post-MVP)

Explicitly **NOT** included in MVP (reserved for future iterations):

### Phase 2 Features
- **Request Forwarding**: Proxy webhooks to other URLs
- **Rate Limiting**: Protect endpoints from abuse
- **Request Replay**: Re-send captured requests
- **Advanced Export**: CSV, HAR format, cURL script generation
- **Request History Limits**: Auto-delete old requests per endpoint
- **Request Editing**: Modify and re-send requests
- **Multiple Response Rules**: Conditional responses based on request content

### Authentication & Multi-User
- User accounts and authentication
- Team collaboration features
- Permission management
- Endpoint sharing

### Advanced Deployment
- Docker official image (stretch goal, may include in MVP)
- Kubernetes manifests
- Cloud deployment guides (AWS, GCP, Azure)
- Horizontal scaling (requires PostgreSQL instead of SQLite)

### Integrations
- Slack/Discord notifications on webhook receipt
- Webhook forwarding chains
- Third-party service integrations
- API webhooks for automation

### Advanced UI
- Mobile responsive design (tablet only in MVP)
- Request diffing (compare two requests)
- Request timeline visualization
- Dashboard analytics and charts

### Enterprise Features
- SSO/SAML authentication
- Audit logs
- Compliance reporting
- SLA guarantees

## Dependencies

### External Dependencies

**Technical:**
- **Rust toolchain** (v1.75+): Required for compilation
- **Node.js** (v18+): Required for frontend development
- **SQLite** (bundled): No external dependency for users

**Libraries:**
- Axum ecosystem (stable, actively maintained)
- shadcn/ui components (stable, good docs)
- SQLx (mature, production-ready)

### Internal Dependencies

**Team:**
- **Primary Developer**: Backend + integration
- **Frontend Contributor** (optional): UI polish
- **Community Testing**: Beta testers for cross-platform validation

**Documentation:**
- README with quick start guide
- Architecture documentation
- API documentation (OpenAPI spec)
- Deployment guide

### Timeline Dependencies

**Week 1: Foundation**
- Database schema finalized
- Webhook capture working
- Basic API endpoints

**Week 2: Real-Time & UI**
- WebSocket implementation
- Frontend core components
- Integration testing

**Week 3: Polish & Release**
- Custom responses
- Filtering/search
- Documentation
- Release build

## Risks & Mitigation

### Technical Risks

**R-1: SQLite Performance Under Load**
- **Risk**: Write contention with concurrent webhooks
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**: 
  - Enable WAL mode (Write-Ahead Logging)
  - Connection pool with `max_connections=1` for writes
  - Async queue for request inserts
  - Load testing with 1000 req/min before release

**R-2: WebSocket Scalability**
- **Risk**: Too many connections crash the server
- **Likelihood**: Low (MVP unlikely to hit limits)
- **Impact**: Medium
- **Mitigation**:
  - Connection limits (100 concurrent)
  - Automatic cleanup of stale connections
  - Graceful degradation (fall back to polling)

**R-3: Cross-Platform Compilation Issues**
- **Risk**: Binary doesn't work on Windows or ARM
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**:
  - CI/CD with cross-platform builds (GitHub Actions)
  - Community testing on all platforms
  - Documented build instructions

### Resource Risks

**R-4: Timeline Overrun**
- **Risk**: 3 weeks not enough for complete MVP
- **Likelihood**: Medium
- **Impact**: Low
- **Mitigation**:
  - Phased feature deployment (core first, search later)
  - Pre-built shadcn/ui components (faster UI dev)
  - Community contributions for non-critical features

**R-5: Scope Creep**
- **Risk**: Adding Phase 2 features during MVP development
- **Likelihood**: High
- **Impact**: Medium
- **Mitigation**:
  - Strict adherence to PRD scope
  - Feature requests logged for Phase 2
  - Regular scope reviews

### Adoption Risks

**R-6: User Discovery**
- **Risk**: No one finds/uses Hookshot
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**:
  - Launch on Hacker News, Reddit (r/webdev, r/programming)
  - Submit to awesome-lists (awesome-selfhosted, awesome-webhooks)
  - SEO-optimized documentation
  - Comparison guide vs. webhook.site

## Next Steps

### Immediate Actions (Pre-Development)
1. **Review & Approve PRD**: Stakeholder sign-off
2. **Create Epic**: Run `/pm:prd-parse hookshot-mvp`
3. **Set Up Repository**: Initialize Rust + React project structure
4. **CI/CD Pipeline**: GitHub Actions for builds + tests

### Development Phases

**Phase 1: Foundation (Week 1)**
- Database schema + migrations
- Webhook capture handler
- Basic API endpoints (create endpoint, list requests)
- Integration tests

**Phase 2: Real-Time (Week 2)**
- WebSocket server
- Frontend scaffolding (React + shadcn/ui)
- Request list + detail views
- End-to-end real-time flow

**Phase 3: Features (Week 3)**
- Custom response configuration
- Filtering and search
- UI polish and dark mode
- Documentation

**Phase 4: Release (Week 3)**
- Cross-platform builds
- README + guides
- GitHub release
- Community announcement

### Success Checkpoints

**Day 3**: Basic webhook capture working
**Day 7**: Database + API complete
**Day 14**: Real-time updates functional
**Day 21**: MVP ready for beta testing
**Day 28**: Public release

---

## Appendix

### Reference Materials
- webhook.site feature comparison
- SQLite performance benchmarks
- Axum WebSocket examples
- shadcn/ui component library

### Glossary
- **Webhook**: HTTP callback triggered by events
- **UUID**: Universally Unique Identifier (128-bit)
- **WebSocket**: Bi-directional real-time communication protocol
- **SQLite WAL**: Write-Ahead Logging (concurrent read/write mode)
- **shadcn/ui**: Accessible component library for React

### Open Questions
1. Should we support custom endpoint paths (e.g., `/webhook/my-stripe`) or only UUIDs?
   - **Decision**: UUIDs only for MVP (simplicity)
2. Default port: 3000 or 8080?
   - **Decision**: 3000 (common for dev tools)
3. Include Docker image in MVP or post-MVP?
   - **Decision**: Post-MVP (single binary is priority)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-29  
**Owner**: Product Team  
**Reviewers**: Engineering, Design
