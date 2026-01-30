# Hookshot Frontend

React + TypeScript + Vite + shadcn/ui

## API Configuration Fixed

The frontend now uses environment-specific API URLs:

### Development (`npm run dev`)
- Frontend: http://localhost:5173
- API: Proxied to http://localhost:3000/api via Vite

### Preview (`npm run preview`)  
- Frontend: http://localhost:4173
- API: http://localhost:3000/api (direct connection)

### Production (embedded in Rust binary)
- Both served from http://localhost:3000
- API: /api (same origin)

## Quick Start

**Make sure backend is running first:**
```bash
cd /Users/ngoquocdat/Projects/hookshot
cargo run
```

**Then run frontend:**
```bash
# Development mode
npm run dev

# OR Preview mode (after npm run build)
npm run preview
```

The API URL issue is now fixed with proper environment configuration!
