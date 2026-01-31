/**
 * Tests for useWebSocket hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useWebSocket } from './useWebSocket'
import { setupWebSocketMock, cleanupWebSocketMock, getMockWebSocket, MockWebSocket } from '@/test/mocks/websocket'
import type { WebSocketMessage } from '@/lib/types'

describe('useWebSocket', () => {
  beforeEach(() => {
    setupWebSocketMock()
    MockWebSocket.autoConnect = true
  })

  afterEach(() => {
    cleanupWebSocketMock()
    vi.useRealTimers()
    MockWebSocket.autoConnect = true
  })

  it('should not connect when endpointId is null', () => {
    const { result } = renderHook(() => useWebSocket(null))

    expect(result.current.connected).toBe(false)
    expect(result.current.lastMessage).toBe(null)
    expect(result.current.usingPolling).toBe(false)
  })

  it('should connect to WebSocket when endpointId is provided', async () => {
    const endpointId = 'test-endpoint-123'
    const { result } = renderHook(() => useWebSocket(endpointId))

    // Initially not connected
    expect(result.current.connected).toBe(false)

    // Wait for WebSocket to connect (MockWebSocket auto-connects after a tick)
    await waitFor(
      () => {
        expect(result.current.connected).toBe(true)
      },
      { timeout: 1000 }
    )
  })

  it('should construct correct WebSocket URL', async () => {
    const endpointId = 'test-endpoint-123'
    renderHook(() => useWebSocket(endpointId))

    // Wait a bit for the WebSocket to be created
    await new Promise((resolve) => setTimeout(resolve, 10))

    const mockWs = getMockWebSocket()
    expect(mockWs?.url).toContain(`/ws/endpoints/${endpointId}`)
  })

  it('should receive and store WebSocket messages', async () => {
    const endpointId = 'test-endpoint-123'
    const { result } = renderHook(() => useWebSocket(endpointId))

    // Wait for connection
    await waitFor(() => {
      expect(result.current.connected).toBe(true)
    })

    const mockWs = getMockWebSocket()
    const testMessage: WebSocketMessage = {
      type: 'new_request',
      data: {
        id: 1,
        endpoint_id: endpointId,
        method: 'POST',
        path: '/test',
        query_string: '',
        headers: {},
        body: '{"test": true}',
        content_type: 'application/json',
        received_at: '2024-01-31T10:00:00Z',
        ip_address: '127.0.0.1',
      },
    }

    act(() => {
      mockWs?.simulateMessage(testMessage)
    })

    await waitFor(() => {
      expect(result.current.lastMessage).toEqual(testMessage)
    })
  })

  it('should send messages through WebSocket', async () => {
    const endpointId = 'test-endpoint-123'
    const { result } = renderHook(() => useWebSocket(endpointId))

    // Wait for connection
    await waitFor(() => {
      expect(result.current.connected).toBe(true)
    })

    const mockWs = getMockWebSocket()
    const sendSpy = vi.spyOn(mockWs!, 'send')

    const testData = { action: 'ping' }
    result.current.sendMessage(testData)

    expect(sendSpy).toHaveBeenCalled()
  })

  it('should cleanup on unmount', async () => {
    const endpointId = 'test-endpoint-123'
    const { unmount, result } = renderHook(() => useWebSocket(endpointId))

    // Wait for connection
    await waitFor(() => {
      expect(result.current.connected).toBe(true)
    })

    const mockWs = getMockWebSocket()
    const closeSpy = vi.spyOn(mockWs!, 'close')

    unmount()

    expect(closeSpy).toHaveBeenCalled()
  })

  it('should reconnect when endpoint changes', async () => {
    const { result, rerender } = renderHook(
      ({ id }) => useWebSocket(id),
      { initialProps: { id: 'endpoint-1' } }
    )

    // Wait for first connection
    await waitFor(() => {
      expect(result.current.connected).toBe(true)
    })

    const firstWs = getMockWebSocket()
    const firstCloseSpy = vi.spyOn(firstWs!, 'close')

    // Change endpoint
    rerender({ id: 'endpoint-2' })

    expect(firstCloseSpy).toHaveBeenCalled()

    // Wait for new connection
    await waitFor(() => {
      const secondWs = getMockWebSocket()
      return secondWs?.url.includes('/ws/endpoints/endpoint-2')
    })

    const secondWs = getMockWebSocket()
    expect(secondWs?.url).toContain('/ws/endpoints/endpoint-2')
  })

  it('should attempt connection even when WebSocket fails to connect immediately', async () => {
    MockWebSocket.autoConnect = false
    const endpointId = 'test-endpoint-123'
    const { result, unmount } = renderHook(() => useWebSocket(endpointId))

    // Connection should not happen immediately
    expect(result.current.connected).toBe(false)

    // sendMessage should still be available even without connection
    expect(result.current.sendMessage).toBeDefined()
    expect(typeof result.current.sendMessage).toBe('function')

    unmount()
  })

  it('should connect when WebSocket becomes available', async () => {
    MockWebSocket.autoConnect = false
    const endpointId = 'test-endpoint-123'
    const { result, unmount } = renderHook(() => useWebSocket(endpointId))

    // Initially not connected
    expect(result.current.connected).toBe(false)

    // Manually open the WebSocket
    const mockWs = getMockWebSocket()
    await act(async () => {
      mockWs?.open()
    })

    // Should now be connected
    await waitFor(() => {
      expect(result.current.connected).toBe(true)
    })

    unmount()
  })

  it('should handle WebSocket errors gracefully', async () => {
    const endpointId = 'test-endpoint-123'
    const { result } = renderHook(() => useWebSocket(endpointId))

    // Wait for connection
    await waitFor(() => {
      expect(result.current.connected).toBe(true)
    })

    const mockWs = getMockWebSocket()
    act(() => {
      mockWs?.simulateError()
    })

    // Should still be functional, possibly falling back to polling
    expect(result.current.sendMessage).toBeDefined()
  })
})
