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
- `npm run build` - Build for production
- `npm run preview` - Preview production build
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

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Ensure `npm run build` succeeds
5. Submit a pull request

## License

MIT
