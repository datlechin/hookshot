# Frontend Testing Documentation

This directory contains the test setup and utilities for the Hookshot frontend.

## Overview

- **Testing Framework**: Vitest
- **DOM Environment**: happy-dom
- **Component Testing**: React Testing Library
- **API Mocking**: MSW (Mock Service Worker)
- **Custom Mocks**: WebSocket mock implementation

## Directory Structure

```
src/test/
├── setup.ts              # Test environment configuration
└── mocks/
    ├── server.ts         # MSW server setup
    ├── handlers.ts       # API mock handlers
    └── websocket.ts      # WebSocket mock implementation
```

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useMyHook } from './useMyHook'

describe('useMyHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe('expected')
  })
})
```

### Testing with User Interaction

```typescript
import userEvent from '@testing-library/user-event'

it('handles click events', async () => {
  const user = userEvent.setup()
  render(<Button>Click me</Button>)

  await user.click(screen.getByRole('button'))
  expect(screen.getByText('Clicked!')).toBeInTheDocument()
})
```

### Testing Async Behavior

```typescript
import { waitFor } from '@testing-library/react'

it('loads data asynchronously', async () => {
  render(<DataComponent />)

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

## Mocking

### API Mocking (MSW)

API requests are automatically mocked using MSW handlers defined in `mocks/handlers.ts`.

To override handlers in a specific test:

```typescript
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

it('handles API error', async () => {
  server.use(
    http.get('/api/endpoints', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 })
    })
  )

  // Test error handling...
})
```

### WebSocket Mocking

WebSocket connections are mocked using the custom WebSocket mock:

```typescript
import { setupWebSocketMock, getMockWebSocket } from '@/test/mocks/websocket'

beforeEach(() => {
  setupWebSocketMock()
})

it('receives WebSocket messages', async () => {
  const { result } = renderHook(() => useWebSocket('endpoint-id'))

  const mockWs = getMockWebSocket()
  mockWs?.simulateMessage({
    type: 'new_request',
    data: { /* request data */ }
  })

  await waitFor(() => {
    expect(result.current.lastMessage).toBeDefined()
  })
})
```

## Global Mocks

The following are automatically mocked in `setup.ts`:

- `window.matchMedia`
- `IntersectionObserver`
- `ResizeObserver`
- `localStorage`

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the user sees and interacts with
   - Avoid testing internal state or implementation details

2. **Use Accessible Queries**
   - Prefer `getByRole`, `getByLabelText`, `getByText`
   - Avoid `getByTestId` unless necessary

3. **Clean Up After Tests**
   - Tests are automatically cleaned up after each test
   - Use `beforeEach` and `afterEach` for test-specific setup/cleanup

4. **Async Testing**
   - Use `waitFor` for async assertions
   - Use `userEvent.setup()` for user interactions
   - Use fake timers (`vi.useFakeTimers()`) when testing time-dependent code

5. **Meaningful Test Names**
   - Use descriptive test names that explain what is being tested
   - Format: `it('should do something when condition')`

## Coverage

Coverage reports are generated in the `coverage/` directory when running:

```bash
npm run test:coverage
```

Target coverage:
- Statements: > 80%
- Branches: > 80%
- Functions: > 80%
- Lines: > 80%

## Troubleshooting

### Tests timing out
- Check for unresolved promises
- Ensure MSW handlers are properly configured
- Verify cleanup in `afterEach` hooks

### WebSocket tests failing
- Ensure `setupWebSocketMock()` is called in `beforeEach`
- Use fake timers for connection timeout tests
- Call `cleanupWebSocketMock()` in `afterEach`

### Unexpected console warnings
- Check test setup for proper mocking
- Verify React 19 compatibility
- Review component prop types

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
