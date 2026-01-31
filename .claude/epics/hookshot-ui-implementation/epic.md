---
name: hookshot-ui-implementation
status: in-progress
created: 2026-01-30T07:59:43Z
updated: 2026-01-31T08:44:20Z
progress: 56%
prd: .claude/prds/hookshot-ui-implementation.md
github: https://github.com/datlechin/hookshot/issues/23
---

# Epic: Hookshot UI Implementation

## Overview

Build a complete React-based web UI for Hookshot webhook testing tool, featuring real-time request monitoring, endpoint management, and request inspection. The UI will be a single-page application (SPA) using React + TypeScript + Vite, styled with Tailwind CSS and shadcn/ui components, prioritizing a dark-mode-first, compact design optimized for developer productivity.

**Key Features:**
- Real-time webhook monitoring via WebSocket
- 3-panel layout (Endpoints | Requests | Details)
- Request inspection (headers, body, metadata)
- Custom response configuration
- Search, filtering, and export capabilities
- Dark/light mode theming with localStorage persistence

## Architecture Decisions

### AD-1: Technology Stack (Confirmed)
- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite (fast HMR, optimized builds)
- **Styling:** Tailwind CSS (utility-first, dark mode support)
- **UI Components:** shadcn/ui (accessible, customizable)
- **State Management:** React Context (Phase 1), migrate to Zustand if needed
- **Rationale:** Leverages existing project tech stack, minimal dependencies, excellent developer experience

### AD-2: State Management Strategy
- **Phase 1:** React Context API
  - Separate contexts: EndpointsContext, RequestsContext, ThemeContext
  - Simple, built-in, zero additional dependencies
- **Phase 2:** Migrate to Zustand if performance issues arise
  - Zustand is lightweight (~1KB), better devtools, easier debugging
- **Rationale:** Start simple, optimize when needed (YAGNI principle)

### AD-3: Real-time Communication
- **Primary:** WebSocket connection per endpoint
- **Fallback:** HTTP polling (5-second interval) if WebSocket fails
- **Auto-reconnect:** Exponential backoff (1s, 2s, 4s, 8s, max 30s)
- **Connection Status:** Visual indicator in UI (connected/disconnected)
- **Rationale:** Real-time is core feature, but must be resilient to network issues

### AD-4: Performance Optimization
- **Virtual Scrolling:** Use @tanstack/react-virtual for request list
  - Render only ~20 visible items at a time
  - Handle 1000+ requests without lag
- **Lazy Loading:** Request bodies loaded only when detail panel opened
- **Debouncing:** Search input debounced to 300ms
- **Code Splitting:** Lazy load heavy components (syntax highlighter, export)
- **Rationale:** Target is 1000+ requests, must optimize for performance upfront

### AD-5: Type Safety
- **TypeScript Strict Mode:** Enabled for maximum type safety
- **Shared Types:** Define types matching backend API contracts
- **API Client:** Typed API client with TypeScript generics
- **Rationale:** Catch errors at compile-time, improve maintainability

### AD-6: Styling Approach
- **Tailwind CSS:** Utility-first CSS framework
- **CSS Variables:** For theme switching (dark/light)
- **No CSS-in-JS:** Pure CSS compilation only
- **Design Tokens:** Define color palette, spacing, typography in Tailwind config
- **Rationale:** Aligns with PRD requirement for "pure CSS", excellent DX, small bundle

### AD-7: Component Architecture
- **Atomic Design:** Organize components by complexity (ui → components → layout)
- **Custom Hooks:** Extract reusable logic (useEndpoints, useRequests, useWebSocket)
- **Composition over Inheritance:** Use composition for reusability
- **Rationale:** Maintainable, testable, follows React best practices

### AD-8: API Integration
- **REST API:** For CRUD operations (create, read, update, delete)
- **WebSocket:** For real-time updates (new requests)
- **Error Handling:** Centralized error handling in API client
- **Retry Logic:** Exponential backoff for failed requests
- **Rationale:** Robust API client prevents UI errors from backend issues

## Technical Approach

### Frontend Components

#### Layout Components
1. **Header** (`components/layout/Header.tsx`)
   - Hookshot logo/branding
   - "Create Endpoint" button (primary action)
   - Theme toggle (dark/light)
   - Connection status indicator (WebSocket)

2. **Sidebar** (`components/layout/Sidebar.tsx`)
   - Endpoint list (scrollable)
   - Endpoint item: name, UUID, request count badge
   - Selected endpoint highlighted
   - Empty state: "No endpoints yet. Create one to get started."

3. **RequestList** (`components/layout/RequestList.tsx`)
   - Virtual scrolling (@tanstack/react-virtual)
   - Request items: method badge, timestamp, path
   - Filters: method dropdown, search input
   - Empty state: "No requests captured yet. Send a webhook to this endpoint."

4. **DetailPanel** (`components/layout/DetailPanel.tsx`)
   - Tabbed interface: Overview, Headers, Body, Metadata
   - Close button to collapse panel
   - Export menu: JSON, cURL, HTTP raw

#### Endpoint Components
1. **EndpointItem** (`components/endpoint/EndpointItem.tsx`)
   - Display endpoint name/UUID
   - Request count badge
   - Delete button (with confirmation dialog)
   - Active/selected state styling

2. **EndpointConfig** (`components/endpoint/EndpointConfig.tsx`)
   - Custom response toggle
   - Status code input (dropdown + custom input)
   - Headers key-value editor
   - Response body textarea
   - Save/cancel buttons

3. **CreateEndpointButton** (`components/endpoint/CreateEndpointButton.tsx`)
   - Prominent button in header
   - On click: POST /api/endpoints → Display new endpoint
   - Copy URL button (clipboard API)

#### Request Components
1. **RequestItem** (`components/request/RequestItem.tsx`)
   - HTTP method badge (color-coded: POST=green, GET=purple, DELETE=red, PUT=yellow)
   - Relative timestamp ("2s ago", updates every 60s)
   - Request path (truncated with ellipsis if long)
   - Click to open detail panel

2. **RequestBadge** (`components/request/RequestBadge.tsx`)
   - Small, uppercase badge
   - Color-coded by HTTP method
   - Reusable component

3. **RequestFilters** (`components/request/RequestFilters.tsx`)
   - Method filter (multi-select: POST, GET, PUT, DELETE, ALL)
   - Clear filters button
   - Active filter count indicator

4. **RequestSearch** (`components/request/RequestSearch.tsx`)
   - Search input with icon
   - Placeholder: "Search headers or body..."
   - Debounced to 300ms
   - Case-insensitive search

#### Detail Components
1. **RequestOverview** (`components/detail/RequestOverview.tsx`)
   - HTTP method and full path
   - Absolute timestamp (ISO 8601)
   - IP address, User-Agent
   - Query parameters (if any)
   - Request size in bytes

2. **HeadersTab** (`components/detail/HeadersTab.tsx`)
   - Key-value table (alphabetically sorted)
   - Highlight common headers (Content-Type, Authorization)
   - Copy button per header
   - "Copy All as JSON" button

3. **BodyTab** (`components/detail/BodyTab.tsx`)
   - Auto-detect content type (JSON, XML, form-data, plain text)
   - Syntax highlighting (use lightweight library: prism-react-renderer)
   - JSON pretty-print by default
   - "Show Raw" toggle
   - Copy body button

4. **MetadataTab** (`components/detail/MetadataTab.tsx`)
   - Received at (ISO timestamp)
   - Endpoint ID
   - Request ID (database ID)
   - Processing time (if backend provides)

5. **ExportMenu** (`components/detail/ExportMenu.tsx`)
   - Dropdown menu: JSON, cURL, HTTP Raw
   - Generate cURL command from request data
   - Copy to clipboard with confirmation

#### UI Components (shadcn/ui)
- Button, Card, Tabs, Dialog, Input, Select
- Badge, Tooltip, DropdownMenu
- All components styled with Tailwind, accessible (ARIA)

### Custom Hooks

1. **useEndpoints** (`hooks/useEndpoints.ts`)
   ```typescript
   const { endpoints, loading, error, createEndpoint, deleteEndpoint } = useEndpoints();
   ```
   - Fetch endpoints on mount
   - Create new endpoint
   - Delete endpoint (with optimistic updates)
   - Handle loading and error states

2. **useRequests** (`hooks/useRequests.ts`)
   ```typescript
   const { requests, loading, error, clearRequests } = useRequests(endpointId);
   ```
   - Fetch requests for selected endpoint
   - Clear all requests
   - Handle pagination/virtual scrolling

3. **useWebSocket** (`hooks/useWebSocket.ts`)
   ```typescript
   const { connected, lastMessage } = useWebSocket(endpointId);
   ```
   - Establish WebSocket connection
   - Auto-reconnect with exponential backoff
   - Return connection status and last message
   - Clean up on unmount

4. **useTheme** (`hooks/useTheme.ts`)
   ```typescript
   const { theme, toggleTheme } = useTheme();
   ```
   - Detect system preference on first visit
   - Load theme from localStorage
   - Toggle between dark/light mode
   - Update DOM class and localStorage

5. **useLocalStorage** (`hooks/useLocalStorage.ts`)
   ```typescript
   const [value, setValue] = useLocalStorage('key', defaultValue);
   ```
   - Persist data to localStorage
   - Sync across tabs
   - Handle JSON serialization

### Backend Services (API Integration)

#### API Client (`lib/api.ts`)
```typescript
// REST API endpoints
export const api = {
  endpoints: {
    list: () => get<Endpoint[]>('/api/endpoints'),
    create: () => post<Endpoint>('/api/endpoints'),
    delete: (id: string) => del(`/api/endpoints/${id}`),
    updateConfig: (id: string, config: Config) => put(`/api/endpoints/${id}/config`, config),
  },
  requests: {
    list: (endpointId: string) => get<Request[]>(`/api/endpoints/${endpointId}/requests`),
    delete: (id: string) => del(`/api/requests/${id}`),
    clear: (endpointId: string) => del(`/api/endpoints/${endpointId}/requests`),
  },
};
```

#### WebSocket Client (`lib/websocket.ts`)
```typescript
class WebSocketClient {
  connect(endpointId: string): void;
  disconnect(): void;
  onMessage(callback: (message: RequestMessage) => void): void;
  onConnect(callback: () => void): void;
  onDisconnect(callback: () => void): void;
}
```

#### TypeScript Types (`lib/types.ts`)
```typescript
interface Endpoint {
  id: string;
  created_at: string;
  custom_response_enabled: boolean;
  response_status?: number;
  response_headers?: Record<string, string>;
  response_body?: string;
  forward_url?: string;
  max_requests: number;
}

interface Request {
  id: number;
  endpoint_id: string;
  method: string;
  path: string;
  query_string?: string;
  headers: Record<string, string>;
  body?: string;
  content_type?: string;
  received_at: string;
  ip_address: string;
}

interface RequestMessage {
  type: 'new_request';
  data: Request;
}
```

### Infrastructure

#### Build & Deployment
- **Development:** `vite dev` (HMR, instant feedback)
- **Production Build:** `vite build` (optimized, minified)
- **Output:** `dist/` folder (static assets)
- **Backend Integration:** Rust binary serves `dist/` as static files
- **Environment Variables:** `.env` for API URL (defaults to same origin)

#### Testing Strategy
- **Unit Tests:** Vitest for utilities and hooks
- **Integration Tests:** Vitest + MSW (Mock Service Worker) for API client
- **E2E Tests (Optional):** Playwright for critical flows
- **Coverage Target:** >80% for utilities and hooks

#### Performance Monitoring
- **Lighthouse:** Target >90 score (Performance, Accessibility, Best Practices)
- **Bundle Analyzer:** Rollup plugin to visualize bundle size
- **Performance Budget:**
  - Initial bundle: <200KB gzipped
  - Total page size: <500KB gzipped
  - Time to interactive: <2s

## Implementation Strategy

### Development Phases

#### Phase 1: Foundation (Week 1)
**Goal:** Set up project structure and basic UI layout

**Tasks:**
1. Initialize Vite + React + TypeScript project
2. Configure Tailwind CSS + shadcn/ui
3. Set up project structure (folders, files)
4. Implement dark mode with CSS variables
5. Create basic 3-panel layout (static, no data)
6. Set up API client scaffolding (types, fetch wrappers)

**Deliverables:**
- Project runs locally (`npm run dev`)
- Dark mode works
- Layout is responsive (3-panel on >1400px, 2-panel on 1024-1400px)

#### Phase 2: Core Features (Week 2)
**Goal:** Implement endpoint and request management with real API

**Tasks:**
1. Implement useEndpoints hook (create, list, delete)
2. Implement endpoint list in sidebar
3. Implement request list view (static data first, then API)
4. Implement request detail panel (tabs: overview, headers, body)
5. Integrate with backend API (assuming API is ready)
6. Add loading states and error handling

**Deliverables:**
- Can create/delete endpoints
- Can view requests for selected endpoint
- Request details display correctly

#### Phase 3: Real-time & Search (Week 3)
**Goal:** Add WebSocket, filtering, and search

**Tasks:**
1. Implement useWebSocket hook
2. Connect WebSocket per endpoint
3. Update request list in real-time
4. Implement request filtering (by method)
5. Implement request search (headers, body)
6. Add virtual scrolling (@tanstack/react-virtual)

**Deliverables:**
- Requests appear in real-time
- Filtering and search work
- UI handles 1000+ requests smoothly

#### Phase 4: Advanced Features (Week 4)
**Goal:** Custom responses, export, and polish

**Tasks:**
1. Implement endpoint configuration panel
2. Add custom response settings (status, headers, body)
3. Implement export menu (JSON, cURL, HTTP)
4. Add copy-to-clipboard functionality
5. Implement light mode theme
6. Add empty states and loading indicators

**Deliverables:**
- Custom responses work end-to-end
- Export functionality generates valid output
- Light mode looks good
- UI is polished and professional

#### Phase 5: Testing & Optimization (Week 5)
**Goal:** Ensure quality and performance

**Tasks:**
1. Write unit tests for hooks and utilities
2. Write integration tests for API client
3. Run Lighthouse audit, fix issues
4. Run accessibility audit (axe), fix violations
5. Optimize bundle size (code splitting, tree shaking)
6. Cross-browser testing (Chrome, Firefox, Safari)

**Deliverables:**
- >80% test coverage
- Lighthouse score >90
- Zero critical accessibility issues
- Bundle size <500KB gzipped

#### Phase 6: Documentation & Launch (Week 6)
**Goal:** Prepare for launch

**Tasks:**
1. Write README with setup instructions
2. Add screenshots to README
3. Document component props (JSDoc)
4. Create demo video/GIF
5. Integration with Rust backend (embed in binary)
6. Final bug fixes and polish

**Deliverables:**
- Comprehensive README
- Working demo
- Ready for production deployment

### Risk Mitigation

**R-1: WebSocket Reliability**
- **Mitigation:** Implement fallback to HTTP polling, auto-reconnect, connection status indicator
- **Testing:** Simulate network interruptions, test reconnection logic

**R-2: Performance with Large Request Volumes**
- **Mitigation:** Virtual scrolling, lazy loading, performance testing with 1000+ synthetic requests
- **Testing:** Use Chrome DevTools Performance profiling, target 60fps

**R-3: Browser Compatibility**
- **Mitigation:** Use autoprefixer, test on target browsers (Chrome, Firefox, Safari last 2 versions)
- **Testing:** Manual testing across browsers, BrowserStack if needed

**R-4: API Contract Changes**
- **Mitigation:** Define API contracts upfront, use TypeScript types, version API if breaking changes
- **Testing:** Mock API in tests, integration tests catch breaking changes

**R-5: Bundle Size Bloat**
- **Mitigation:** Code splitting, tree shaking, bundle analyzer, avoid heavy dependencies
- **Testing:** Monitor bundle size in CI, fail build if >500KB

### Testing Approach

#### Unit Tests
- **Utilities:** Date formatting, JSON parsing, cURL generation
- **Hooks:** useEndpoints, useRequests, useTheme (with React Testing Library)
- **Coverage:** >80% for utils and hooks

#### Integration Tests
- **API Client:** Mock API with MSW, test CRUD operations
- **WebSocket Client:** Mock WebSocket, test connection/reconnection logic
- **Coverage:** All API endpoints covered

#### E2E Tests (Optional)
- **Critical Flows:** Create endpoint → View request → Inspect details → Delete endpoint
- **Tool:** Playwright
- **Coverage:** 3-5 critical user journeys

#### Accessibility Testing
- **Tool:** axe DevTools
- **Target:** Zero critical violations (WCAG AA)
- **Manual:** Keyboard navigation, screen reader testing (VoiceOver)

## Task Breakdown Preview

To keep the epic manageable and focused, here are the **10 consolidated tasks** that cover all implementation work:

1. **Project Setup & Infrastructure**
   - Initialize Vite + React + TypeScript
   - Configure Tailwind CSS + shadcn/ui
   - Set up project structure and build pipeline
   - Configure ESLint, Prettier, TypeScript strict mode

2. **Core Layout & Theming**
   - Implement 3-panel layout (Header, Sidebar, RequestList, DetailPanel)
   - Implement dark/light mode with CSS variables
   - Create responsive breakpoints (3-panel, 2-panel, single-panel)
   - Add theme toggle and localStorage persistence

3. **API Client & Type Definitions**
   - Define TypeScript types (Endpoint, Request, Config)
   - Implement REST API client with error handling
   - Implement WebSocket client with auto-reconnect
   - Create custom hooks (useEndpoints, useRequests, useWebSocket, useTheme)

4. **Endpoint Management**
   - Implement endpoint list in sidebar
   - Create endpoint creation flow (button → API → update UI)
   - Implement endpoint deletion with confirmation dialog
   - Add copy URL to clipboard functionality

5. **Request List & Filtering**
   - Implement virtual scrolling for request list
   - Add request items with method badges, timestamps, paths
   - Implement filtering by HTTP method
   - Add search functionality (headers, body) with debouncing

6. **Request Detail Panel**
   - Implement tabbed interface (Overview, Headers, Body, Metadata)
   - Add syntax highlighting for JSON/XML bodies
   - Implement copy functionality (individual headers, full body)
   - Create export menu (JSON, cURL, HTTP raw)

7. **Real-time Updates**
   - Connect WebSocket per endpoint
   - Handle incoming request messages
   - Update request list in real-time
   - Add connection status indicator
   - Implement fallback to HTTP polling

8. **Custom Response Configuration**
   - Create endpoint configuration panel
   - Implement custom response toggle
   - Add status code, headers, body inputs
   - Save configuration to backend (PUT /api/endpoints/:id/config)

9. **Performance Optimization & Polish**
   - Optimize bundle size (code splitting, lazy loading)
   - Add loading states and empty states
   - Implement error handling and validation
   - Add animations (pulse for new requests, smooth transitions)
   - Cross-browser testing

10. **Testing, Documentation & Deployment**
    - Write unit tests (utilities, hooks) with Vitest
    - Write integration tests (API client) with MSW
    - Run Lighthouse and accessibility audits
    - Write README with setup instructions
    - Create screenshots and demo
    - Integrate with Rust backend (embed dist/ folder)

**Note:** Tasks are designed to be worked on sequentially where there are dependencies, but Tasks 4-6 can be parallelized since they touch different parts of the codebase.

## Dependencies

### External Dependencies
1. **Backend API** (Blocker for Phase 2+)
   - REST API endpoints must be implemented and documented
   - WebSocket server must be ready
   - API contract defined (request/response formats)
   - **Timeline:** Week 1
   - **Owner:** Backend developer

2. **Database Schema** (Blocker for Task 3)
   - Endpoint and Request tables must be stable
   - TypeScript types must match DB schema
   - **Timeline:** Week 1
   - **Owner:** Backend developer

3. **shadcn/ui Components**
   - Component library installation and configuration
   - No blocker, can proceed independently
   - **Timeline:** Week 1 (Task 1)

### Internal Dependencies
1. **API Contract Review** (Blocker for Task 3)
   - Backend team confirms API endpoints
   - TypeScript types defined
   - **Timeline:** Week 1
   - **Decision by:** Backend developer

2. **Testing Environment** (Blocker for Phase 2)
   - Local backend running for integration testing
   - **Timeline:** Week 2
   - **Owner:** Backend developer

3. **Deployment Process** (Blocker for Phase 6)
   - Documentation for embedding frontend in Rust binary
   - **Timeline:** Week 6
   - **Owner:** Backend developer

### Third-Party Service Dependencies
- **None** - Self-hosted architecture, no external services required

## Success Criteria (Technical)

### Performance Benchmarks
- [x] Page load time: <1.5s (Lighthouse)
- [x] Time to interactive: <2s
- [x] First request visible: <100ms after WebSocket message
- [x] Search/filter response: <100ms
- [x] Virtual scrolling: 60fps with 1000+ requests

### Quality Gates
- [x] Lighthouse score: >90 (Performance, Accessibility, Best Practices)
- [x] TypeScript errors: 0
- [x] ESLint errors: 0
- [x] Test coverage: >80% (utilities, hooks)
- [x] Zero critical accessibility violations (axe)

### Acceptance Criteria
- [x] All FR-1 to FR-6 from PRD implemented
- [x] Dark mode works flawlessly
- [x] Light mode works flawlessly
- [x] Real-time updates work with <100ms latency
- [x] UI is responsive (1024px - 2560px)
- [x] Cross-browser compatible (Chrome, Firefox, Safari last 2 versions)

### Non-Functional Requirements Met
- [x] Bundle size: <500KB gzipped
- [x] Dependencies: <20 (excluding dev dependencies)
- [x] Build time: <30s
- [x] No memory leaks during 8-hour session
- [x] Works without WebSocket (HTTP polling fallback)

## Estimated Effort

### Timeline
- **Phase 1 (Foundation):** 1 week
- **Phase 2 (Core Features):** 1 week
- **Phase 3 (Real-time & Search):** 1 week
- **Phase 4 (Advanced Features):** 1 week
- **Phase 5 (Testing & Optimization):** 1 week
- **Phase 6 (Documentation & Launch):** 1 week

**Total:** 6 weeks (can compress to 4-5 weeks if working full-time)

### Resource Requirements
- **Frontend Developer:** 1 FTE (full-time equivalent)
- **Backend Developer:** 0.25 FTE (API contract, integration support)
- **Designer (Optional):** 0.1 FTE (design review, feedback)

### Critical Path Items
1. **Week 1:** API contract must be finalized before Week 2
2. **Week 2:** Backend API must be ready for integration
3. **Week 3:** WebSocket server must be working
4. **Week 6:** Backend must support embedded frontend deployment

### Assumptions
- Developer is experienced with React, TypeScript, Tailwind
- Backend API will be stable (no breaking changes mid-development)
- No major scope changes after Week 2
- Testing environment (backend) available by Week 2

## Tasks Created

- [ ] [#25](https://github.com/datlechin/hookshot/issues/25) - Project Setup & Infrastructure (parallel: false)
- [ ] [#26](https://github.com/datlechin/hookshot/issues/26) - Core Layout & Theming (parallel: false, depends on #25)
- [ ] [#27](https://github.com/datlechin/hookshot/issues/27) - API Client & Type Definitions (parallel: true, depends on #25)
- [ ] [#28](https://github.com/datlechin/hookshot/issues/28) - Endpoint Management (parallel: true, depends on #26, #27)
- [ ] [#29](https://github.com/datlechin/hookshot/issues/29) - Request List & Filtering (parallel: true, depends on #26, #27)
- [ ] [#30](https://github.com/datlechin/hookshot/issues/30) - Request Detail Panel (parallel: true, depends on #26, #27)
- [ ] [#31](https://github.com/datlechin/hookshot/issues/31) - Real-time Updates (parallel: false, depends on #27, #29)
- [ ] [#32](https://github.com/datlechin/hookshot/issues/32) - Custom Response Configuration (parallel: true, depends on #27, #28)
- [ ] [#33](https://github.com/datlechin/hookshot/issues/33) - Performance Optimization & Polish (parallel: false, depends on #28-#32)
- [ ] [#34](https://github.com/datlechin/hookshot/issues/34) - Testing, Documentation & Deployment (parallel: false, depends on #33)

**Total tasks:** 10
**Parallel tasks:** 5 (Issues #27, #28, #29, #30, #32)
**Sequential tasks:** 5 (Issues #25, #26, #31, #33, #34)
**Estimated total effort:** 74-88 hours (~9-11 days full-time)

## Next Steps

1. ✅ Epic created and decomposed into tasks
2. ✅ Tasks synced to GitHub (Epic: #23, Tasks: #25-#34)
3. **Next:** Run `/pm:epic-start hookshot-ui-implementation` to create development worktree
4. Begin Phase 1 development (Issue #25)
