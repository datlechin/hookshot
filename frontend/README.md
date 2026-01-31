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

## Project Structure

```
src/
├── components/
│   ├── layout/         # Layout components (Header, Footer, etc.)
│   ├── endpoint/       # Endpoint-related components
│   ├── request/        # Request list and filtering components
│   ├── detail/         # Request detail view components
│   └── ui/             # Reusable UI components (Button, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and API clients
│   ├── api.ts          # REST API client
│   ├── websocket.ts    # WebSocket client
│   ├── types.ts        # TypeScript type definitions
│   └── utils.ts        # Helper functions
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles with Tailwind
```

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

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Ensure `npm run build` succeeds
5. Test across browsers (see Testing Checklist above)
6. Submit a pull request

## License

MIT
