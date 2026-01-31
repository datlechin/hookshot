# Hookshot Frontend

Modern frontend for Hookshot webhook testing tool, built with Vite, React, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 (pure CSS, no UI library)
- **Icons:** lucide-react
- **Code Quality:** ESLint + Prettier

## Prerequisites

- Node.js 18+
- npm or pnpm

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` to set your API endpoints:
   - `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8080)
   - `VITE_WS_BASE_URL` - WebSocket URL (default: ws://localhost:8080)

3. **Start development server:**
   ```bash
   npm run dev
   ```

   App will be available at http://localhost:3000

4. **Build for production:**
   ```bash
   npm run build
   ```

   Output will be in `dist/` directory

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run build:analyze` - Build with bundle size analysis (generates dist/stats.html)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run all tests with Vitest
- `npm run test:ui` - Run tests with interactive UI
- `npm run test:coverage` - Generate test coverage report

## Project Structure

```
src/
├── components/
│   ├── layout/         # Layout components (Sidebar, RequestList, DetailPanel)
│   ├── endpoint/       # Endpoint-related components (EndpointItem, EndpointConfig)
│   ├── detail/         # Request detail view components (tabs, export menu)
│   └── ui/             # Reusable UI components (Button, Tabs, etc.)
├── contexts/           # React Context providers (EndpointContext)
├── hooks/              # Custom React hooks (useEndpoints, useKeyboard, useToast)
├── lib/                # Utilities and API clients
│   ├── api.ts          # REST API client
│   ├── websocket.ts    # WebSocket client
│   ├── types.ts        # TypeScript type definitions
│   └── utils.ts        # Helper functions
├── pages/              # Page components (NotFound)
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles with Tailwind
```

## Architecture

### Component Architecture

The application follows a **modular component architecture** with clear separation of concerns:

#### Layout Components (`components/layout/`)

The main application uses a **3-panel layout**:

1. **Sidebar** (280px, left panel)
   - Displays list of webhook endpoints
   - Create/delete endpoint actions
   - Endpoint selection and configuration

2. **RequestList** (flex-1, center panel)
   - Shows requests for selected endpoint
   - Search and filter functionality
   - Virtual scrolling for performance
   - Real-time updates via WebSocket

3. **DetailPanel** (480px, right panel, collapsible)
   - Displays detailed request information
   - Tabbed interface (Overview, Headers, Body, Metadata)
   - Export and copy actions
   - Closes with ESC key or X button

```
┌─────────┬──────────────┬─────────────┐
│ Sidebar │ RequestList  │ DetailPanel │
│ (280px) │   (flex-1)   │   (480px)   │
│         │              │             │
│ [New]   │ Search...    │ [X] Close   │
│         │              │             │
│ • EP1   │ ┌──────────┐ │ ┌─────────┐ │
│ • EP2   │ │ Request  │ │ │ Headers │ │
│ • EP3   │ │ Details  │ │ │ Body    │ │
│         │ └──────────┘ │ │ Meta    │ │
│         │              │ └─────────┘ │
└─────────┴──────────────┴─────────────┘
```

#### State Management

**Context-based State:**
- `EndpointContext` - Global endpoint selection state
- Shared across Sidebar, RequestList, and DetailPanel
- Prevents prop drilling

**Local Component State:**
- Each component manages its own UI state
- Examples: modal visibility, loading states, form data

**Server State:**
- Custom hooks for data fetching (`useEndpoints`)
- WebSocket for real-time updates
- No complex state management library needed

#### Data Flow

```
User Action → Component → API/WebSocket → Backend
                ↓                           ↓
         Update UI State ← Real-time Update
```

**Example Flow: Creating an Endpoint**
1. User clicks "New" button in Sidebar
2. `handleCreateEndpoint()` calls `createEndpoint()` hook
3. API request sent to backend
4. Backend creates endpoint and returns data
5. Hook updates local state
6. Sidebar re-renders with new endpoint
7. Toast notification shows success

**Example Flow: Real-time Request Updates**
1. Backend receives webhook request
2. WebSocket broadcasts message to connected clients
3. `RequestList` component receives message
4. New request added to list automatically
5. Virtual scrolling updates view

### Custom Hooks

#### `useEndpoints()`
Manages endpoint CRUD operations:
```typescript
const {
  endpoints,        // List of all endpoints
  loading,          // Loading state
  error,            // Error state
  createEndpoint,   // Create new endpoint
  deleteEndpoint,   // Delete endpoint
  updateConfig      // Update endpoint config
} = useEndpoints()
```

#### `useKeyboard(shortcuts)`
Handles keyboard shortcuts:
```typescript
useKeyboard([
  { key: 'n', handler: createEndpoint, description: 'New endpoint' },
  { key: '/', handler: focusSearch, description: 'Search' }
])
```

#### `useToast()`
Manages toast notifications:
```typescript
const { success, error, info } = useToast()
success('Endpoint created!')
error('Failed to delete endpoint')
```

### API Layer

#### REST API (`lib/api.ts`)

Centralized API client with typed methods:

```typescript
export const api = {
  endpoints: {
    list: () => get<Endpoint[]>('/api/endpoints'),
    create: () => post<Endpoint>('/api/endpoints'),
    delete: (id: string) => del(`/api/endpoints/${id}`),
    updateConfig: (id: string, config: EndpointConfig) =>
      put(`/api/endpoints/${id}/config`, config)
  },
  requests: {
    list: (endpointId: string) =>
      get<WebhookRequest[]>(`/api/endpoints/${endpointId}/requests`),
    delete: (id: number) => del(`/api/requests/${id}`)
  }
}
```

**Features:**
- Automatic error handling
- TypeScript type safety
- Configurable base URL via environment variables
- Async/await based

#### WebSocket Client (`lib/websocket.ts`)

Real-time updates for incoming webhook requests:

```typescript
const ws = new WebSocketClient(endpointId)
ws.connect()
ws.subscribe((message) => {
  if (message.type === 'new_request') {
    // Add new request to list
  }
})
```

**Features:**
- Automatic reconnection on disconnect
- Event subscription system
- Per-endpoint connections
- Connection lifecycle management

### TypeScript Types

All data structures are strongly typed in `lib/types.ts`:

```typescript
interface Endpoint {
  id: string
  created_at: string
  custom_response_enabled: boolean
  response_status: number
  response_headers: Record<string, string>
  response_body: string
  forward_url: string | null
  max_requests: number
  rate_limit_per_minute: number | null
}

interface WebhookRequest {
  id: number
  endpoint_id: string
  method: string
  path: string
  query_string: string
  headers: Record<string, string>
  body: string
  content_type: string
  received_at: string
  ip_address: string
}
```

### Performance Patterns

#### Lazy Loading
Major layout components are lazy-loaded to reduce initial bundle size:

```typescript
const Sidebar = lazy(() => import('@/components/layout/Sidebar'))
const RequestList = lazy(() => import('@/components/layout/RequestList'))
const DetailPanel = lazy(() => import('@/components/layout/DetailPanel'))
```

#### Virtual Scrolling
Request list uses `@tanstack/react-virtual` for efficient rendering of large lists:
- Only renders visible items + buffer
- Smooth scrolling with thousands of requests
- Minimal memory footprint

#### Optimized Re-renders
- `React.memo()` for expensive components
- `useCallback()` for stable function references
- Context selectors to prevent unnecessary re-renders

### Error Handling

**Component Level:**
- `ErrorBoundary` wraps the entire app
- Catches and displays React errors gracefully
- Prevents white screen of death

**API Level:**
- All API calls wrapped in try/catch
- User-friendly error messages
- Toast notifications for errors

**WebSocket Level:**
- Automatic reconnection on disconnect
- Connection status indicators
- Fallback to polling if WebSocket unavailable

### Testing Strategy

**Unit Tests:**
- UI component behavior
- Utility functions
- Custom hooks

**Accessibility Tests:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support

**Integration Tests:**
- API client
- WebSocket client
- End-to-end user flows

See accessibility tests in `*.a11y.test.tsx` files.

## Styling

This project uses **pure Tailwind CSS** without any component libraries like shadcn/ui. All components are built from scratch using Tailwind utility classes.

### Theme

The app supports dark mode (default) with a light mode toggle. Theme colors are defined using CSS variables in `src/index.css`:

```css
:root {
  --background: #ffffff;
  --surface: #f9fafb;
  --text-primary: #111827;
  /* ... */
}

.dark {
  --background: #0a0a0a;
  --surface: #1a1a1a;
  --text-primary: #e5e5e5;
  /* ... */
}
```

### Custom Components

All UI components are in `src/components/ui/` and use Tailwind CSS:
- `Button.tsx` - Button component with variants (primary, secondary, outline, ghost, danger)

## TypeScript

This project uses strict TypeScript configuration:
- All strict mode flags enabled
- No unused locals or parameters
- No fallthrough cases in switch statements

Type definitions are in `src/lib/types.ts`.

## Code Quality

- **ESLint:** Configured with React, TypeScript, and Prettier rules
- **Prettier:** Automatic code formatting
- **Strict TypeScript:** Zero tolerance for type errors

## Development Guidelines

1. Use TypeScript for all new files
2. Follow the existing component structure
3. Use Tailwind utility classes for styling (no custom CSS)
4. Keep components small and focused
5. Write meaningful commit messages

## API Integration

The frontend communicates with the Rust backend via:
- REST API (`src/lib/api.ts`) - CRUD operations
- WebSocket (`src/lib/websocket.ts`) - Real-time updates

Example usage:

```typescript
import { apiClient } from '@/lib/api'

// Create endpoint
const endpoint = await apiClient.createEndpoint()

// Get requests
const requests = await apiClient.getRequests(endpoint.id)
```

## WebSocket Real-time Updates

```typescript
import { WebSocketClient } from '@/lib/websocket'

const ws = new WebSocketClient(endpointId)
ws.connect()

ws.subscribe((message) => {
  if (message.type === 'new_request') {
    // Handle new request
  }
})
```

## Performance Optimization

This frontend is optimized for production performance with the following techniques:

### Code Splitting & Lazy Loading

- **Route-based code splitting:** Main app components are lazy-loaded using React.lazy()
- **Heavy dependencies:** Syntax highlighter (react-syntax-highlighter) is code-split automatically
- **Component-level splitting:** Large modals and panels are loaded on-demand

### Bundle Size Analysis

Run bundle analysis to inspect composition:

```bash
npm run build:analyze
```

This generates `dist/stats.html` showing:
- Bundle composition and chunk sizes
- Gzipped sizes for each chunk
- Module-level breakdown of what's included

**Current Bundle Sizes (as of last build):**
- Main bundle: ~60 KB gzipped (well under 300 KB target)
- Vendor chunks:
  - `vendor-syntax`: ~229 KB gzipped (syntax highlighter - lazy loaded)
  - `vendor-utils`: ~11 KB gzipped
- CSS: ~6 KB gzipped

### Performance Targets Achieved

- ✅ Main bundle <300 KB gzipped
- ✅ Code splitting for routes and heavy components
- ✅ Tree shaking enabled (Vite defaults)
- ✅ CSS purging via Tailwind CSS
- ✅ Optimized production builds with minification

### Performance Best Practices

1. **Lazy Loading:** Use React.lazy() for heavy components and routes
2. **Virtual Scrolling:** Request list uses @tanstack/react-virtual for large datasets
3. **Loading States:** Skeleton loaders prevent layout shift
4. **Debounced Actions:** Search and filter inputs are debounced to reduce re-renders
5. **Optimized Re-renders:** React.memo and useCallback used strategically

### Monitoring Bundle Size

Watch for bundle size increases:
- Run `npm run build` to see gzipped sizes
- Warning shown if any chunk exceeds 600 KB
- Use `npm run build:analyze` to identify large dependencies

## Cross-Browser Testing

This app has been tested and works correctly on:

### Desktop Browsers
- ✅ Chrome (latest) - Primary development browser
- ✅ Firefox (latest) - Tested for compatibility
- ✅ Safari (latest, macOS) - WebKit testing
- ✅ Edge (latest) - Chromium-based, good compatibility

### Mobile Browsers
- ✅ Safari (iOS) - Mobile layout tested
- ✅ Chrome Mobile (Android) - Mobile layout tested

### Key Features Tested Across Browsers
- WebSocket real-time connections
- Clipboard API (copy endpoint URL, copy request data)
- CSS Grid/Flexbox layouts (responsive design)
- Dark mode / Light mode toggle
- LocalStorage persistence (theme, preferences)
- Syntax highlighting (react-syntax-highlighter)
- Virtual scrolling (@tanstack/react-virtual)

### Known Browser Issues
- None currently identified

### Testing Checklist

When adding new features, test these across browsers:

1. **WebSocket Connection**
   - Real-time updates work
   - Connection recovers after network interruption
   - No memory leaks on reconnection

2. **Clipboard Operations**
   - Copy endpoint URL
   - Copy request body/headers
   - Fallback works if Clipboard API unavailable

3. **Responsive Design**
   - Mobile layout (< 768px)
   - Tablet layout (768px - 1024px)
   - Desktop layout (> 1024px)

4. **Dark/Light Mode**
   - Theme toggle works
   - Preference persists in localStorage
   - Colors are accessible (contrast ratios)

5. **Performance**
   - Large request lists scroll smoothly
   - No janky animations
   - Syntax highlighting doesn't block UI

For detailed testing procedures, see [TESTING.md](./TESTING.md).

## Lighthouse Performance

Target scores (run on production build):
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >80

Run Lighthouse audit:
1. Build for production: `npm run build`
2. Preview: `npm run preview`
3. Open Chrome DevTools → Lighthouse
4. Run audit on http://localhost:4173

## Accessibility (a11y)

This application is built with accessibility as a core principle, targeting **WCAG 2.1 Level AA compliance**.

### Key Accessibility Features

1. **Keyboard Navigation**
   - All interactive elements are keyboard accessible
   - Tab order follows logical visual flow
   - Keyboard shortcuts for common actions (see Keyboard Shortcuts section)
   - Focus indicators visible on all interactive elements

2. **Screen Reader Support**
   - Semantic HTML structure (header, nav, main, aside, etc.)
   - Proper ARIA labels and descriptions
   - Live regions for real-time updates
   - Alternative text for all icons and images

3. **Color and Contrast**
   - All text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
   - Information not conveyed by color alone
   - Theme switcher for user preference (dark/light mode)

4. **Responsive Design**
   - Mobile-first approach
   - Touch targets at least 44x44px
   - Responsive layouts work across all screen sizes
   - Text scales properly with zoom up to 200%

5. **Form Controls**
   - All inputs have associated labels
   - Error messages linked to form fields
   - Clear focus states
   - Validation feedback accessible to screen readers

### Accessibility Testing

#### Automated Testing

We use **@axe-core/react** for automated accessibility testing in development mode:

```typescript
// Runs automatically in development
// Check browser console for accessibility violations
```

Run accessibility tests:
```bash
npm run test -- --grep "a11y|accessibility"
```

Example accessibility tests are available in:
- `src/components/endpoint/EndpointItem.a11y.test.tsx`
- `src/components/layout/DetailPanel.a11y.test.tsx`

#### Manual Testing Checklist

1. **Keyboard Navigation**
   - [ ] Tab through all interactive elements
   - [ ] Use arrow keys in lists and menus
   - [ ] Escape key closes modals/panels
   - [ ] Enter/Space activates buttons

2. **Screen Reader Testing**
   - [ ] Test with NVDA (Windows) or VoiceOver (macOS)
   - [ ] All content is announced properly
   - [ ] Landmarks are correctly identified
   - [ ] Dynamic updates are announced

3. **Visual Testing**
   - [ ] Zoom to 200% - content remains readable
   - [ ] Test with reduced motion preference
   - [ ] Check focus indicators are visible
   - [ ] Verify color contrast ratios

4. **Tools for Testing**
   - Chrome DevTools Lighthouse (Accessibility audit)
   - axe DevTools browser extension
   - WAVE browser extension
   - Screen reader (NVDA/VoiceOver/JAWS)

### Keyboard Shortcuts

The application supports keyboard shortcuts for efficient navigation:

| Shortcut | Action |
|----------|--------|
| `n` | Create new endpoint |
| `/` | Focus search/filter |
| `c` | Copy selected request as cURL |
| `e` | Export selected request |
| `Esc` | Close detail panel or modal |
| `?` | Show keyboard shortcuts help |

All shortcuts are documented in the app via the `?` shortcut.

### Accessibility Guidelines for Contributors

When adding new features or components:

1. **Use semantic HTML** - Use appropriate elements (button, nav, main, etc.)
2. **Add ARIA labels** - Provide accessible names for all interactive elements
3. **Test keyboard navigation** - Ensure all functionality works without a mouse
4. **Check color contrast** - Use tools to verify contrast ratios
5. **Write accessibility tests** - Add `.a11y.test.tsx` files for new components
6. **Test with screen readers** - Verify content is properly announced
7. **Document keyboard shortcuts** - Update docs when adding new shortcuts

Example of accessible component:

```tsx
<button
  onClick={handleClick}
  aria-label="Delete endpoint"
  className="..."
>
  <Trash2 className="w-4 h-4" />
</button>
```

### Known Accessibility Issues

None currently identified. Please report any accessibility issues you encounter.

### Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Ensure `npm run build` succeeds
5. Test across browsers (see Testing Checklist above)
6. Submit a pull request

## License

MIT
