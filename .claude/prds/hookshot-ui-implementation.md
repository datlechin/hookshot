---
name: hookshot-ui-implementation
description: Complete UI implementation for Hookshot webhook testing tool with dark mode, compact design, and real-time monitoring
status: backlog
created: 2026-01-30T07:54:19Z
---

# PRD: Hookshot UI Implementation

## Executive Summary

Hookshot is a self-hosted webhook testing and debugging tool that enables developers to capture, inspect, and test webhooks without external dependencies. This PRD defines the complete user interface implementation using React, TypeScript, and pure CSS (Tailwind), prioritizing a compact, dark-mode-first design that maximizes information density while maintaining excellent usability.

The UI will provide real-time webhook monitoring, detailed request inspection, endpoint management, and configuration capabilities—all within a streamlined, developer-focused interface optimized for efficiency and speed.

## Problem Statement

### What problem are we solving?

Developers testing webhook integrations currently face several challenges:

1. **External dependency**: Existing tools like webhook.site require internet connectivity and have usage limits
2. **Poor visibility**: Debugging webhooks is difficult without seeing full request details (headers, body, timing)
3. **No customization**: Can't configure custom responses or forwarding for testing different scenarios
4. **Context switching**: Need to jump between multiple tools for testing, monitoring, and debugging
5. **Inefficient UI**: Existing tools have cluttered interfaces with poor information density

### Why is this important now?

Hookshot's backend (Rust + Axum + SQLite) is ready, but without a UI, it's unusable for most developers. The UI is the primary interface through which users will:

- Monitor incoming webhooks in real-time
- Debug request/response cycles
- Configure endpoint behavior
- Validate webhook implementations

A well-designed UI directly impacts developer productivity and tool adoption.

## User Stories

### Primary Personas

**1. Backend Developer (Primary)**

- Testing webhook integrations during development
- Debugging production webhook issues locally
- Validating request payloads from third-party services

**2. QA Engineer (Secondary)**

- Testing webhook flows end-to-end
- Validating error handling scenarios
- Documenting webhook behavior

### Detailed User Journeys

#### Journey 1: First-Time User Creating Webhook Endpoint

```
Sarah (Backend Developer) needs to test Stripe webhook integration

1. Opens Hookshot → Sees clean, empty dashboard with "Create Endpoint" button
2. Clicks "Create Endpoint" → New endpoint created with UUID, URL displayed
3. Clicks "Copy URL" → URL copied to clipboard with visual confirmation
4. Pastes URL into Stripe dashboard webhook settings
5. Triggers test webhook from Stripe
6. Sees request appear in real-time with visual notification
7. Clicks request → Views full headers and JSON payload
8. Verifies webhook structure is correct
9. Continues testing with confidence
```

**Pain points addressed:**

- No account creation or configuration needed
- Instant endpoint generation (< 1 second)
- One-click URL copying
- Real-time feedback when request arrives
- Complete request visibility

#### Journey 2: Debugging Webhook Payload Issues

```
Marcus (Backend Developer) receives webhook but server rejects it

1. Opens Hookshot with existing endpoint
2. Sends webhook from service → Request appears immediately
3. Clicks request → Inspects headers tab
4. Finds Content-Type is application/x-www-form-urlencoded (expected JSON)
5. Clicks "Body" tab → Sees raw payload
6. Clicks "Copy as cURL" → Copies exact request for testing
7. Pastes cURL in terminal to reproduce locally
8. Identifies and fixes parser issue
9. Clears old requests → Retests with clean slate
```

**Pain points addressed:**

- Detailed header inspection
- Raw body viewing
- Export as cURL for reproduction
- Request history management

#### Journey 3: Testing Custom Responses

```
Elena (QA Engineer) needs to test error handling when webhook endpoint fails

1. Opens endpoint configuration panel
2. Enables "Custom Response"
3. Sets status code to 500
4. Sets response body: {"error": "Service unavailable"}
5. Triggers webhook from service
6. Verifies service retry logic kicks in
7. Changes status to 200 → Verifies success handling
8. Disables custom response → Returns to default behavior
```

**Pain points addressed:**

- Easy response customization
- No code deployment needed for testing
- Quick toggle between scenarios

#### Journey 4: Managing Multiple Endpoints

```
David (Backend Developer) testing multiple services simultaneously

1. Creates endpoint for Stripe → Copies URL → Pastes in Stripe
2. Creates endpoint for GitHub → Copies URL → Pastes in GitHub
3. Creates endpoint for Twilio → Copies URL → Pastes in Twilio
4. Clicks Stripe endpoint in sidebar → Views only Stripe requests
5. Clicks GitHub endpoint → Views only GitHub requests
6. Searches for "issue_comment" in GitHub requests → Filters results
7. Exports filtered requests as JSON for documentation
8. Deletes Twilio endpoint after testing complete
```

**Pain points addressed:**

- Multi-endpoint isolation
- Easy endpoint switching
- Request filtering and search
- Cleanup after testing

### Key Pain Points Being Addressed

1. **Slow debugging cycles**: Real-time monitoring eliminates guesswork
2. **Limited visibility**: Full request inspection (headers, body, metadata)
3. **Manual effort**: One-click copying, filtering, and export
4. **Context switching**: All testing tools in one interface
5. **Poor UX in existing tools**: Compact, keyboard-friendly, dark mode design

## Requirements

### Functional Requirements

#### FR-1: Endpoint Management

**FR-1.1: Create Endpoint**

- User clicks "Create Endpoint" button
- System generates unique UUID
- System displays endpoint URL: `http://localhost:8080/webhook/{uuid}`
- User can copy URL with one click
- **Acceptance Criteria:**
  - Endpoint created in < 500ms
  - UUID is valid v4 format
  - Copy button shows visual confirmation (checkmark, 2s duration)

**FR-1.2: List Endpoints**

- Display all user-created endpoints in left sidebar
- Show endpoint name (or UUID if unnamed)
- Show request count badge
- Show active/inactive status
- **Acceptance Criteria:**
  - Sidebar shows max 20 endpoints without scroll
  - Selected endpoint is visually highlighted
  - Empty state shows helpful message

**FR-1.3: Delete Endpoint**

- User clicks delete icon on endpoint
- System shows confirmation dialog
- On confirm, deletes endpoint and all requests
- **Acceptance Criteria:**
  - Confirmation required (prevents accidents)
  - Deletion is immediate (no reload needed)
  - Associated requests are removed

**FR-1.4: Rename Endpoint (Optional)**

- User double-clicks endpoint name
- Inline editing enabled
- User types new name → Saves on blur/enter
- **Acceptance Criteria:**
  - Name validation (max 50 chars)
  - Updates persist to database

#### FR-2: Request Monitoring

**FR-2.1: Real-time Request Display**

- WebSocket connection per endpoint
- New requests appear at top of list
- Visual notification (pulse animation)
- Auto-scroll to new request (unless user scrolled up)
- **Acceptance Criteria:**
  - Request appears within 100ms of receipt
  - No page refresh needed
  - Animation does not disrupt reading
  - User can pause auto-scroll

**FR-2.2: Request List View**

- Display requests in reverse chronological order (newest first)
- Show per request:
  - HTTP method (POST, GET, PUT, DELETE) with color badge
  - Relative timestamp ("2s ago", "5m ago")
  - Request path (truncated if long)
  - Status code (if custom response)
  - IP address (optional, collapsed by default)
- **Acceptance Criteria:**
  - List handles 500 requests without lag
  - Virtual scrolling for 1000+ requests
  - Timestamps update every 60s

**FR-2.3: Request Filtering**

- Filter by HTTP method (POST, GET, PUT, DELETE, etc.)
- Filter by status code (if custom responses enabled)
- Filter by date range (optional)
- **Acceptance Criteria:**
  - Filter updates list in < 100ms
  - Multiple filters can combine (AND logic)
  - Clear all filters with one click

**FR-2.4: Request Search**

- Search box with placeholder "Search headers or body..."
- Search in request headers (case-insensitive)
- Search in request body (case-insensitive)
- Highlight matching terms
- **Acceptance Criteria:**
  - Search results update as user types (debounced 300ms)
  - Shows count of matching requests
  - Works with filters

#### FR-3: Request Details Inspector

**FR-3.1: Request Overview**

- Display when user clicks request in list
- Show full request details in right panel:
  - HTTP method and path
  - Absolute timestamp
  - IP address and user agent
  - Query parameters (if any)
  - Request size (bytes)
- **Acceptance Criteria:**
  - Details load in < 50ms
  - Panel is scrollable if content overflows
  - Close button to collapse panel

**FR-3.2: Headers Tab**

- Display all request headers as key-value pairs
- Format as table or definition list
- Highlight common headers (Content-Type, Authorization)
- Copy individual header value
- Copy all headers as JSON
- **Acceptance Criteria:**
  - Headers are alphabetically sorted
  - Long values are wrapped, not truncated
  - Copy button per header

**FR-3.3: Body Tab**

- Display request body with syntax highlighting
- Auto-detect content type (JSON, XML, form data, plain text)
- Format JSON with indentation
- Show raw body toggle
- Copy body to clipboard
- **Acceptance Criteria:**
  - JSON is pretty-printed by default
  - Invalid JSON shows raw text
  - Syntax highlighting for JSON/XML
  - Binary data shows hex view or download button

**FR-3.4: Metadata Tab**

- Show additional request metadata:
  - Received at (full ISO timestamp)
  - Processing time (if tracked)
  - Endpoint ID
  - Request ID (database ID)
- **Acceptance Criteria:**
  - All metadata is selectable for copying
  - ISO timestamps include timezone

**FR-3.5: Export Request**

- Export as JSON (full request object)
- Export as cURL command (for reproduction)
- Export as HTTP raw text
- **Acceptance Criteria:**
  - JSON export includes all fields
  - cURL command is valid and runnable
  - Copy button for each export format

#### FR-4: Custom Response Configuration

**FR-4.1: Enable Custom Responses**

- Toggle switch on endpoint settings
- When enabled, shows configuration form
- When disabled, returns default 200 OK
- **Acceptance Criteria:**
  - Toggle persists to database
  - Takes effect immediately for new requests

**FR-4.2: Configure Response Status**

- Dropdown or input for HTTP status code
- Common codes as presets (200, 201, 400, 404, 500)
- Custom code input (100-599)
- **Acceptance Criteria:**
  - Validates status code range
  - Shows description for common codes

**FR-4.3: Configure Response Headers**

- Key-value input for custom headers
- Add/remove header rows
- Common presets (Content-Type, Location)
- **Acceptance Criteria:**
  - Unlimited headers supported
  - Validates header name format
  - Stores as JSON in database

**FR-4.4: Configure Response Body**

- Textarea for response body
- JSON/XML validation (optional)
- Template variables support (optional, future)
- **Acceptance Criteria:**
  - Supports up to 10KB response body
  - No syntax validation required (any text)
  - Persists to database

#### FR-5: Request Forwarding (Phase 2)

**FR-5.1: Enable Forwarding**

- Toggle switch on endpoint settings
- Input for forward URL
- Validate URL format
- **Acceptance Criteria:**
  - URL validation (http/https only)
  - Persists to database
  - Shows last forward status

**FR-5.2: View Forward Results**

- Show forwarding status in request details
- Display forward response (status, headers, body)
- Show forwarding errors if failed
- **Acceptance Criteria:**
  - Forward happens asynchronously
  - Timeout after 30s
  - Errors are logged

#### FR-6: UI Theme & Appearance

**FR-6.1: Dark Mode (Default)**

- Dark background (#0a0a0a, #1a1a1a)
- Light text (#e5e5e5, #a1a1a1)
- Accent colors for badges (blue, green, red, yellow)
- Subtle borders and shadows
- **Acceptance Criteria:**
  - Meets WCAG AA contrast ratio (4.5:1 for text)
  - Comfortable for extended use
  - No pure black (#000) or pure white (#fff)

**FR-6.2: Light Mode Toggle**

- Theme toggle in header
- Switches to light mode palette
- Preference saved in localStorage
- **Acceptance Criteria:**
  - Instant theme switch (no flicker)
  - Persists across sessions
  - Detects system preference on first visit

**FR-6.3: Compact Layout**

- Minimal padding and margins
- Dense information display
- Small fonts (14px base, 12px secondary)
- Efficient use of screen space
- **Acceptance Criteria:**
  - 3-panel layout fits on 1920x1080 screen
  - No excessive whitespace
  - Content is readable without strain

#### FR-7: Keyboard Shortcuts (Optional, Future)

- `Cmd/Ctrl + K`: Create new endpoint
- `Cmd/Ctrl + /`: Focus search
- `Cmd/Ctrl + D`: Delete selected endpoint
- `Esc`: Close detail panel
- **Acceptance Criteria:**
  - Shortcuts work globally
  - Shown in tooltip or help modal

#### FR-8: Request History Management

**FR-8.1: Auto-Cleanup**

- Configurable max requests per endpoint (default: 100)
- Oldest requests auto-deleted when limit reached
- **Acceptance Criteria:**
  - Deletion happens in background
  - No UI disruption

**FR-8.2: Manual Clear**

- "Clear All Requests" button per endpoint
- Confirmation dialog
- **Acceptance Criteria:**
  - Immediate effect
  - Cannot be undone (warning shown)

### Non-Functional Requirements

#### NFR-1: Performance

**NFR-1.1: Page Load Time**

- Initial page load < 1.5 seconds (on broadband)
- Time to interactive < 2 seconds
- **Measurement**: Lighthouse performance score > 90

**NFR-1.2: Request Rendering**

- New request appears in < 100ms
- Request detail loads in < 50ms
- Search/filter updates in < 100ms
- **Measurement**: Chrome DevTools Performance profiling

**NFR-1.3: Memory Usage**

- Handle 1000 requests without exceeding 100MB memory
- No memory leaks during long sessions (8+ hours)
- **Measurement**: Chrome DevTools Memory profiling

**NFR-1.4: Virtual Scrolling**

- Implement virtual scrolling for request list
- Render only visible requests (~20 at a time)
- **Measurement**: 60fps scroll performance with 1000+ requests

#### NFR-2: Responsiveness

**NFR-2.1: Screen Size Support**

- Optimal: 1920x1080 and above
- Minimum: 1024x768 (functional with horizontal scroll)
- Mobile: Read-only view (future enhancement)
- **Measurement**: Test on multiple resolutions

**NFR-2.2: Layout Adaptation**

- 3-panel layout on wide screens (> 1400px)
- 2-panel layout on medium screens (1024-1400px, hide sidebar)
- Single panel on small screens (< 1024px)
- **Measurement**: Manual testing across breakpoints

#### NFR-3: Accessibility

**NFR-3.1: Keyboard Navigation**

- All interactive elements keyboard accessible
- Tab order is logical
- Focus indicators visible
- **Measurement**: Manual keyboard-only testing

**NFR-3.2: Screen Reader Support**

- Semantic HTML elements
- ARIA labels where needed
- Alt text for icons
- **Measurement**: VoiceOver/NVDA testing

**NFR-3.3: Color Contrast**

- WCAG AA compliance (4.5:1 for normal text)
- WCAG AAA for critical elements (7:1)
- **Measurement**: axe DevTools audit

#### NFR-4: Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- No IE11 support required

#### NFR-5: Security

**NFR-5.1: Input Sanitization**

- Sanitize all user inputs (endpoint names, search queries)
- Prevent XSS in request body rendering
- **Implementation**: DOMPurify for HTML sanitization

**NFR-5.2: WebSocket Security**

- WSS (WebSocket Secure) in production
- Authentication token per connection (future)
- **Implementation**: Backend handles auth

**NFR-5.3: CORS**

- Frontend served from same origin as backend
- No CORS issues expected
- **Implementation**: Embedded frontend in Rust binary

#### NFR-6: Maintainability

**NFR-6.1: Code Quality**

- TypeScript strict mode enabled
- ESLint + Prettier configured
- Component-based architecture
- **Measurement**: Zero TypeScript errors, zero ESLint errors

**NFR-6.2: Testing**

- Unit tests for utilities (> 80% coverage)
- Integration tests for API calls
- E2E tests for critical flows (optional)
- **Measurement**: Vitest coverage report

**NFR-6.3: Documentation**

- Component props documented (JSDoc)
- README with setup instructions
- Architecture decision records (ADR)

## Success Criteria

### Measurable Outcomes

**Primary Success Metrics:**

1. **User Adoption (Self-Hosted Metric)**
   - GitHub stars: 100+ in first 3 months
   - Docker pulls: 500+ in first 3 months
   - Active forks: 20+ in first 6 months

2. **Performance Metrics**
   - Page load time: < 1.5s (Lighthouse)
   - Time to first request visible: < 100ms
   - Search/filter response time: < 100ms
   - Zero crashes during 8-hour sessions

3. **Quality Metrics**
   - Lighthouse score: > 90 (Performance, Accessibility, Best Practices)
   - TypeScript/ESLint errors: 0
   - Test coverage: > 80%
   - Zero critical accessibility violations (axe)

4. **User Experience Metrics**
   - Task completion rate: > 95% for core workflows
   - Average time to create endpoint + view first request: < 30s
   - User satisfaction (GitHub issues/feedback): > 4.5/5

**Secondary Success Metrics:**

5. **Code Quality**
   - Bundle size: < 500KB (gzipped)
   - Dependencies: < 20 (excluding dev)
   - Build time: < 30s

6. **Community Engagement**
   - GitHub issues: Active responses within 48h
   - Contributions: 5+ external contributors in 6 months
   - Documentation: Comprehensive README + screenshots

### Key Performance Indicators (KPIs)

**Week 1-2 (Development):**

- [ ] UI mockups approved
- [ ] Component library setup complete
- [ ] API integration working

**Week 3-4 (Implementation):**

- [ ] All FR-1 to FR-6 implemented
- [ ] Lighthouse score > 85
- [ ] Zero critical bugs

**Month 1 (Launch):**

- [ ] 50+ GitHub stars
- [ ] 3+ positive user testimonials
- [ ] Zero data loss incidents

**Month 3 (Adoption):**

- [ ] 100+ GitHub stars
- [ ] 5+ community contributions
- [ ] Feature parity with webhook.site (for core features)

## Constraints & Assumptions

### Technical Constraints

**TC-1: Technology Stack (Fixed)**

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS (pure CSS compilation)
- UI Components: shadcn/ui
- No runtime CSS-in-JS libraries allowed

**TC-2: Backend Integration**

- Backend API is Rust + Axum + SQLite
- WebSocket support required for real-time updates
- Single binary deployment (frontend embedded)

**TC-3: Browser Limitations**

- Must work without WebSocket (fallback to polling)
- LocalStorage for preferences (no IndexedDB required)
- No service workers (not a PWA initially)

**TC-4: Performance Constraints**

- Virtual scrolling required for 1000+ requests
- Lazy loading for request bodies
- No server-side rendering (static SPA)

### Resource Constraints

**RC-1: Development Time**

- Target: 4-6 weeks for MVP (Phase 1)
- Team size: 1-2 developers
- Part-time development expected

**RC-2: Hosting**

- Self-hosted only (no cloud infrastructure)
- Users run on localhost or private networks
- No CDN, no distributed storage

**RC-3: Budget**

- Open-source project (zero budget)
- No paid services or APIs
- Community-driven development

### Assumptions

**A-1: User Environment**

- Users have modern browsers (last 2 versions)
- Users have localhost access or private network
- Users are technical (developers/QA)

**A-2: Usage Patterns**

- Typical session: 1-4 endpoints, 10-100 requests
- Heavy usage: 10+ endpoints, 1000+ requests
- Requests are primarily JSON (80%+)

**A-3: Network**

- WebSocket connection is stable
- Latency < 50ms for localhost
- No proxy or firewall blocking WebSockets

**A-4: Data Retention**

- Requests auto-deleted after limit (default 100/endpoint)
- No long-term storage needed
- Database size manageable (< 1GB typical)

**A-5: Security**

- Self-hosted = trusted network
- No authentication required for MVP
- Users understand security implications

**A-6: Browser Features**

- JavaScript enabled
- Cookies/LocalStorage enabled
- Modern CSS support (Grid, Flexbox, CSS variables)

## Out of Scope

The following features are explicitly NOT part of this PRD (may be future enhancements):

### OS-1: Advanced Features

**Not Included in MVP:**

- ❌ Request replay functionality (Phase 3)
- ❌ Rate limiting configuration UI (Phase 3)
- ❌ Advanced filtering (regex, complex queries)
- ❌ Request diff/comparison tool
- ❌ Batch operations (bulk delete, export)
- ❌ Request grouping/categorization
- ❌ Request annotations/notes
- ❌ Collaboration features (sharing endpoints)

### OS-2: Authentication & Security

**Not Included:**

- ❌ User authentication/login
- ❌ Multi-user support
- ❌ Role-based access control (RBAC)
- ❌ API key management
- ❌ Endpoint access restrictions
- ❌ Audit logging

### OS-3: Integration & Export

**Not Included:**

- ❌ CSV export (JSON only)
- ❌ Integration with external tools (Slack, Discord)
- ❌ Webhook forwarding to multiple URLs
- ❌ Request transformation/modification
- ❌ Custom scripting/plugins

### OS-4: Mobile & Embedded

**Not Included:**

- ❌ Native mobile apps (iOS/Android)
- ❌ Progressive Web App (PWA) features
- ❌ Offline mode
- ❌ Mobile-optimized UI
- ❌ Embedded widget for other tools

### OS-5: Analytics & Monitoring

**Not Included:**

- ❌ Request analytics/charts
- ❌ Endpoint usage statistics
- ❌ Performance monitoring dashboard
- ❌ Alerting/notifications
- ❌ Historical trend analysis

### OS-6: Advanced UI

**Not Included:**

- ❌ Drag-and-drop endpoint reordering
- ❌ Customizable dashboard layouts
- ❌ Saved search/filter presets
- ❌ Keyboard shortcut customization
- ❌ Multiple theme options (only dark/light)
- ❌ Custom color schemes

### OS-7: Data Management

**Not Included:**

- ❌ Backup/restore functionality
- ❌ Import requests from other tools
- ❌ Database encryption
- ❌ Data compression
- ❌ Cloud sync

### OS-8: Documentation & Help

**Not Included in UI:**

- ❌ Interactive onboarding tour
- ❌ In-app documentation
- ❌ Video tutorials
- ❌ Contextual help tooltips (beyond basic)
- ❌ Changelog viewer

### OS-9: Enterprise Features

**Not Included:**

- ❌ LDAP/SSO integration
- ❌ On-premise deployment tools
- ❌ High availability setup
- ❌ Load balancing
- ❌ Horizontal scaling

### OS-10: Developer Tools

**Not Included:**

- ❌ Mock server capabilities
- ❌ API testing suite
- ❌ Request validation against schemas
- ❌ Contract testing
- ❌ Performance testing

## Dependencies

### External Dependencies

**ED-1: Backend API Dependencies**

- **Dependency**: Rust backend (Axum framework) must be running
- **Status**: Assumed complete (per project overview)
- **Risk**: If API contracts change, frontend must update
- **Mitigation**: Define API contract early, version API endpoints

**ED-2: WebSocket Server**

- **Dependency**: WebSocket server for real-time updates
- **Status**: Must be implemented in backend
- **Risk**: WebSocket connection failures affect UX
- **Mitigation**: Implement fallback to HTTP polling

**ED-3: Database Schema**

- **Dependency**: SQLite schema for endpoints and requests
- **Status**: Must be defined and stable
- **Risk**: Schema changes break existing data
- **Mitigation**: Database migrations, versioning

**ED-4: shadcn/ui Components**

- **Dependency**: shadcn/ui component library
- **Status**: Open-source, actively maintained
- **Risk**: Breaking changes in updates
- **Mitigation**: Pin versions, test before upgrading

**ED-5: Build Tools**

- **Dependency**: Node.js, Vite, TypeScript compiler
- **Status**: Stable ecosystem
- **Risk**: Build failures, version conflicts
- **Mitigation**: Lock versions in package.json

### Internal Dependencies

**ID-1: API Endpoint Definitions**

- **Dependency**: API contracts for:
  - `GET /api/endpoints` - List endpoints
  - `POST /api/endpoints` - Create endpoint
  - `DELETE /api/endpoints/:id` - Delete endpoint
  - `GET /api/endpoints/:id/requests` - Get requests
  - `WS /api/endpoints/:id/stream` - WebSocket stream
  - `PUT /api/endpoints/:id/config` - Update config
- **Owner**: Backend team
- **Timeline**: Week 1-2
- **Blocker**: Frontend cannot start API integration without this

**ID-2: WebSocket Protocol**

- **Dependency**: WebSocket message format specification
- **Format**: JSON messages with `type` and `payload`
- **Example**: `{"type": "request", "payload": {...}}`
- **Owner**: Backend team
- **Timeline**: Week 1-2
- **Blocker**: Real-time updates depend on this

**ID-3: Database Models**

- **Dependency**: TypeScript types matching DB schema
- **Models**: Endpoint, Request, Config
- **Owner**: Backend team (provide schema)
- **Timeline**: Week 1
- **Blocker**: Type safety requires matching models

**ID-4: Embedded Frontend Build**

- **Dependency**: Backend must serve compiled frontend
- **Implementation**: Serve `dist/` folder as static files
- **Owner**: Backend team
- **Timeline**: Week 4 (integration)
- **Blocker**: Deployment requires this

### Team Dependencies

**TD-1: Design Review**

- **Dependency**: UI/UX mockup approval (if designer involved)
- **Owner**: Design team or project lead
- **Timeline**: Week 1
- **Blocker**: Implementation waits for design approval

**TD-2: API Contract Review**

- **Dependency**: Backend developer confirms API endpoints
- **Owner**: Backend developer
- **Timeline**: Week 1
- **Blocker**: Frontend development paused until confirmed

**TD-3: Testing Environment**

- **Dependency**: Local backend running for integration testing
- **Owner**: Backend developer
- **Timeline**: Week 2
- **Blocker**: Integration tests require running backend

**TD-4: Deployment Process**

- **Dependency**: Documentation for embedding frontend in Rust binary
- **Owner**: Backend developer
- **Timeline**: Week 4
- **Blocker**: Final deployment requires this

### Third-Party Service Dependencies

**TS-1: None for MVP**

- No external APIs, CDNs, or third-party services required
- Self-hosted architecture eliminates external dependencies
- **Risk**: None

## Technical Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│  Browser (React SPA)                        │
│  ┌─────────────────────────────────────┐   │
│  │  UI Components (shadcn/ui)          │   │
│  │  ┌───────────┬──────────┬─────────┐ │   │
│  │  │ Endpoints │ Requests │ Details │ │   │
│  │  │  Sidebar  │   List   │  Panel  │ │   │
│  │  └───────────┴──────────┴─────────┘ │   │
│  │                                      │   │
│  │  State Management (React Context)   │   │
│  │  API Client (fetch + WebSocket)     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↓ HTTP/WS
┌─────────────────────────────────────────────┐
│  Backend (Rust + Axum)                      │
│  ┌─────────────────────────────────────┐   │
│  │  REST API Handlers                  │   │
│  │  WebSocket Manager                  │   │
│  │  Database Layer (SQLite + SQLx)     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Frontend Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Logo, theme toggle, create button
│   │   ├── Sidebar.tsx             # Endpoints list
│   │   ├── RequestList.tsx         # Middle panel (requests)
│   │   └── DetailPanel.tsx         # Right panel (details)
│   ├── endpoint/
│   │   ├── EndpointItem.tsx        # Single endpoint in sidebar
│   │   ├── EndpointConfig.tsx      # Configuration form
│   │   └── CreateEndpointButton.tsx
│   ├── request/
│   │   ├── RequestItem.tsx         # Single request in list
│   │   ├── RequestBadge.tsx        # Method badge (POST, GET)
│   │   ├── RequestFilters.tsx      # Filter controls
│   │   └── RequestSearch.tsx       # Search input
│   ├── detail/
│   │   ├── RequestOverview.tsx     # Summary info
│   │   ├── HeadersTab.tsx          # Headers display
│   │   ├── BodyTab.tsx             # Body with syntax highlighting
│   │   ├── MetadataTab.tsx         # Additional metadata
│   │   └── ExportMenu.tsx          # Export options
│   └── ui/                         # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── tabs.tsx
│       └── ...
├── hooks/
│   ├── useEndpoints.ts             # Endpoint CRUD operations
│   ├── useRequests.ts              # Fetch requests for endpoint
│   ├── useWebSocket.ts             # WebSocket connection
│   ├── useTheme.ts                 # Dark/light mode
│   └── useLocalStorage.ts          # Persist preferences
├── lib/
│   ├── api.ts                      # REST API client
│   ├── websocket.ts                # WebSocket client
│   ├── types.ts                    # TypeScript types
│   └── utils.ts                    # Utility functions
├── App.tsx                         # Root component
├── main.tsx                        # Entry point
└── index.css                       # Tailwind + custom CSS
```

### API Integration Points

**REST API:**

- `GET /api/endpoints` → List all endpoints
- `POST /api/endpoints` → Create new endpoint
- `PUT /api/endpoints/:id` → Update endpoint config
- `DELETE /api/endpoints/:id` → Delete endpoint
- `GET /api/endpoints/:id/requests` → Get requests for endpoint
- `DELETE /api/endpoints/:id/requests` → Clear all requests
- `DELETE /api/requests/:id` → Delete single request

**WebSocket:**

- `WS /api/ws/:endpoint_id` → Real-time request stream
- Message format: `{"type": "new_request", "data": {...}}`

### State Management Strategy

**Option 1: React Context (Recommended for MVP)**

- Lightweight, built-in solution
- Separate contexts for endpoints, requests, theme
- No additional dependencies

**Option 2: Zustand (If Needed for Performance)**

- Minimal overhead (< 1KB)
- Better performance for large state
- Easier to debug

**Decision: Start with Context, migrate to Zustand if performance issues arise**

### Data Flow

1. **User creates endpoint:**
   - UI → POST `/api/endpoints` → Backend → SQLite
   - Backend returns endpoint object → UI updates

2. **User views requests:**
   - UI → GET `/api/endpoints/:id/requests` → Backend → SQLite
   - Backend returns request list → UI displays
   - WebSocket connection established → Real-time updates

3. **New request arrives:**
   - External service → POST `/webhook/:uuid` → Backend
   - Backend saves to SQLite → Broadcasts via WebSocket
   - UI receives WebSocket message → Updates request list

4. **User configures custom response:**
   - UI → PUT `/api/endpoints/:id/config` → Backend → SQLite
   - Next webhook request uses custom config

## Implementation Phases

### Phase 1: MVP (Weeks 1-4)

**Week 1: Foundation**

- [ ] Project setup (Vite + React + TypeScript)
- [ ] Tailwind + shadcn/ui configuration
- [ ] Basic component structure (Header, Sidebar, RequestList)
- [ ] Dark mode implementation
- [ ] API client scaffolding

**Week 2: Core Features**

- [ ] Endpoint CRUD (create, list, delete)
- [ ] Request list view (static data first)
- [ ] Request detail panel (tabs: overview, headers, body)
- [ ] WebSocket integration for real-time updates

**Week 3: Enhanced Features**

- [ ] Request filtering (by method)
- [ ] Request search (headers, body)
- [ ] Copy buttons (URL, cURL, JSON)
- [ ] Custom response configuration UI
- [ ] Virtual scrolling for request list

**Week 4: Polish & Integration**

- [ ] Light mode theme
- [ ] Empty states and loading indicators
- [ ] Error handling and validation
- [ ] Build optimization (bundle size)
- [ ] Integration testing with backend
- [ ] Documentation (README, screenshots)

### Phase 2: Enhancements (Weeks 5-6)

**Week 5: Advanced Features**

- [ ] Request forwarding UI
- [ ] Export functionality (JSON, cURL, HTTP)
- [ ] Endpoint renaming
- [ ] Request history limits configuration
- [ ] Performance optimizations

**Week 6: Quality & Testing**

- [ ] Unit tests for utilities
- [ ] Integration tests for API client
- [ ] Accessibility audit (axe)
- [ ] Performance audit (Lighthouse)
- [ ] Cross-browser testing
- [ ] Bug fixes and refinements

### Phase 3: Future Enhancements (Backlog)

- [ ] Request replay functionality
- [ ] Rate limiting configuration UI
- [ ] Advanced filtering (regex, complex queries)
- [ ] Keyboard shortcuts
- [ ] Request annotations
- [ ] PWA features (offline mode)
- [ ] Mobile-responsive layout

## Design Guidelines

### Color Palette

**Dark Mode (Default):**

```css
--background: #0a0a0a; /* Main background */
--surface: #1a1a1a; /* Cards, panels */
--surface-hover: #2a2a2a; /* Hover states */
--border: #333333; /* Borders */
--text-primary: #e5e5e5; /* Main text */
--text-secondary: #a1a1a1; /* Secondary text */
--text-tertiary: #6b7280; /* Tertiary text */
--accent-blue: #3b82f6; /* Links, primary actions */
--accent-green: #10b981; /* Success, POST method */
--accent-red: #ef4444; /* Errors, DELETE method */
--accent-yellow: #f59e0b; /* Warnings, PUT method */
--accent-purple: #8b5cf6; /* GET method */
```

**Light Mode:**

```css
--background: #ffffff;
--surface: #f9fafb;
--surface-hover: #f3f4f6;
--border: #e5e7eb;
--text-primary: #111827;
--text-secondary: #6b7280;
--text-tertiary: #9ca3af;
/* Accents remain same */
```

### Typography

- **Headings**: Inter, system-ui fallback
- **Body**: Inter, 14px base size
- **Code**: JetBrains Mono, monospace
- **Line height**: 1.5 for body, 1.2 for headings

### Spacing Scale

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Component Patterns

**Buttons:**

- Primary: Blue background, white text
- Secondary: Transparent, border, hover background
- Danger: Red background, white text
- Icon-only: Square, subtle hover

**Badges:**

- Method badges: Small, uppercase, color-coded
- Status badges: Rounded, subtle background

**Cards:**

- Subtle border, no shadow in dark mode
- Small shadow in light mode
- Rounded corners (8px)

**Inputs:**

- Dark background in dark mode
- Border on focus
- Placeholder in tertiary color

### Responsive Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Layout Breakpoints:**

- `< 1024px`: Single panel (mobile)
- `1024px - 1400px`: 2-panel (sidebar collapsible)
- `> 1400px`: 3-panel (full layout)

## Risk Assessment

### High-Priority Risks

**R-1: WebSocket Reliability**

- **Risk**: WebSocket connections may drop, causing missed requests
- **Impact**: High (core feature)
- **Probability**: Medium (network issues, browser limitations)
- **Mitigation**:
  - Implement auto-reconnect with exponential backoff
  - Fallback to HTTP polling if WebSocket fails
  - Show connection status indicator in UI

**R-2: Performance with Large Request Volumes**

- **Risk**: UI becomes sluggish with 1000+ requests
- **Impact**: High (user experience)
- **Probability**: Medium (heavy users)
- **Mitigation**:
  - Virtual scrolling implementation (react-window)
  - Lazy load request bodies
  - Pagination or auto-cleanup
  - Performance testing with synthetic data

**R-3: Browser Compatibility**

- **Risk**: Modern CSS/JS features may not work in older browsers
- **Impact**: Medium (limits user base)
- **Probability**: Low (target modern browsers)
- **Mitigation**:
  - Define minimum browser versions upfront
  - Use autoprefixer for CSS
  - Test on target browsers

### Medium-Priority Risks

**R-4: API Contract Changes**

- **Risk**: Backend API changes break frontend
- **Impact**: High (blocks development)
- **Probability**: Low (API should be stable)
- **Mitigation**:
  - Define API contract early
  - Use TypeScript types matching backend
  - Version API if breaking changes needed

**R-5: Bundle Size Bloat**

- **Risk**: Too many dependencies increase bundle size
- **Impact**: Medium (slower page load)
- **Probability**: Medium (easy to add dependencies)
- **Mitigation**:
  - Audit bundle regularly (webpack-bundle-analyzer)
  - Tree-shaking enabled
  - Lazy load heavy components

**R-6: Accessibility Gaps**

- **Risk**: UI not accessible to keyboard/screen reader users
- **Impact**: Medium (excludes some users)
- **Probability**: Medium (easy to overlook)
- **Mitigation**:
  - Use semantic HTML
  - Test with keyboard navigation
  - Run axe audits

### Low-Priority Risks

**R-7: Theme Switching Flicker**

- **Risk**: Flash of unstyled content when switching themes
- **Impact**: Low (minor UX issue)
- **Probability**: Medium
- **Mitigation**:
  - Load theme preference from localStorage immediately
  - CSS class toggle, not style recalculation

**R-8: Copy-to-Clipboard Failures**

- **Risk**: Clipboard API may not work in all contexts
- **Impact**: Low (non-critical feature)
- **Probability**: Low (modern browsers support it)
- **Mitigation**:
  - Fallback to manual selection + Ctrl+C
  - Show instructions if clipboard fails

**R-9: JSON Parsing Errors**

- **Risk**: Invalid JSON in request bodies causes crashes
- **Impact**: Low (graceful degradation)
- **Probability**: High (many non-JSON webhooks)
- **Mitigation**:
  - Try-catch around JSON.parse()
  - Show raw text if parsing fails

## Open Questions

1. **Q: Should we support request body editing/modification before forwarding?**
   - **Status**: Deferred to Phase 3
   - **Decision needed by**: Week 2

2. **Q: Should endpoints have expiration/TTL (auto-delete after X hours)?**
   - **Status**: Nice-to-have, not MVP
   - **Decision needed by**: Week 3

3. **Q: Should we show request response time (if backend tracks it)?**
   - **Status**: Yes, if backend provides data
   - **Decision needed by**: Week 1 (backend confirmation)

4. **Q: Should we support importing/exporting entire endpoint configurations?**
   - **Status**: Deferred to Phase 2
   - **Decision needed by**: Week 5

5. **Q: Should we show forwarding latency/status in request list (not just detail)?**
   - **Status**: TBD, depends on UX design
   - **Decision needed by**: Week 2

6. **Q: Should we cache request list in localStorage for offline viewing?**
   - **Status**: No for MVP (adds complexity)
   - **Decision needed by**: N/A

7. **Q: Should we support multiple WebSocket connections (one per endpoint)?**
   - **Status**: Yes, if performance allows
   - **Decision needed by**: Week 2 (after testing)

8. **Q: Should we show visual diff when request payload changes between webhooks?**
   - **Status**: Future enhancement (Phase 3)
   - **Decision needed by**: N/A

---

## Approval & Sign-off

**Created by:** Product Manager / Lead Developer
**Date:** 2026-01-30T07:54:19Z
**Status:** Draft → Ready for Review

**Reviewers:**

- [ ] Backend Developer (API contract confirmation)
- [ ] UI/UX Designer (design approval, if applicable)
- [ ] Tech Lead (architecture review)
- [ ] Project Stakeholders (scope and timeline approval)

**Next Steps:**

1. Review and approve this PRD
2. Run: `/pm:prd-parse hookshot-ui-implementation` to create implementation epic
3. Break epic into tasks and sync to GitHub
4. Begin Phase 1 development

---

**End of PRD**
