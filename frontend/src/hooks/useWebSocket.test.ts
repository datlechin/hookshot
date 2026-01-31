/**
 * Tests for useWebSocket hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWebSocket } from './useWebSocket'
import { setupWebSocketMock, cleanupWebSocketMock, getMockWebSocket } from '@/test/mocks/websocket'
import type { WebSocketMessage } from '@/lib/types'

describe('useWebSocket', () => {
  beforeEach(() => {
    setupWebSocketMock()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanupWebSocketMock()
    vi.useRealTimers()
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

    // Advance timers to allow WebSocket to "connect"
    await vi.runAllTimersAsync()

    await waitFor(() => {
      expect(result.current.connected).toBe(true)
    })
  })

  it('should construct correct WebSocket URL', async () => {
    const endpointId = 'test-endpoint-123'
    renderHook(() => useWebSocket(endpointId))

    await vi.runAllTimersAsync()

    const mockWs = getMockWebSocket()
    expect(mockWs?.url).toContain(`/ws/endpoints/${endpointId}`)
  })

  it('should receive and store WebSocket messages', async () => {
    const endpointId = 'test-endpoint-123'
    const { result } = renderHook(() => useWebSocket(endpointId))

    await vi.runAllTimersAsync()

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

    mockWs?.simulateMessage(testMessage)

    await waitFor(() => {
      expect(result.current.lastMessage).toEqual(testMessage)
    })
  })

  it('should send messages through WebSocket', async () => {
    const endpointId = 'test-endpoint-123'
    const { result } = renderHook(() => useWebSocket(endpointId))

    await vi.runAllTimersAsync()

    const mockWs = getMockWebSocket()
    const sendSpy = vi.spyOn(mockWs!, 'send')

    const testData = { action: 'ping' }
    result.current.sendMessage(testData)

    expect(sendSpy).toHaveBeenCalled()
  })

  it('should cleanup on unmount', async () => {
    const endpointId = 'test-endpoint-123'
    const { unmount } = renderHook(() => useWebSocket(endpointId))

    await vi.runAllTimersAsync()

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

    await vi.runAllTimersAsync()

    const firstWs = getMockWebSocket()
    const firstCloseSpy = vi.spyOn(firstWs!, 'close')

    // Change endpoint
    rerender({ id: 'endpoint-2' })

    await vi.runAllTimersAsync()

    expect(firstCloseSpy).toHaveBeenCalled()

    const secondWs = getMockWebSocket()
    expect(secondWs?.url).toContain('/ws/endpoints/endpoint-2')
  })

  it('should fall back to polling on connection timeout', async () => {
    const endpointId = 'test-endpoint-123'
    const { result } = renderHook(() => useWebSocket(endpointId))

    // Don't let WebSocket connect, simulate timeout
    // The mock opens immediately, so we need to prevent that
    const mockWs = getMockWebSocket()
    if (mockWs) {
      mockWs.readyState = WebSocket.CONNECTING
    }

    // Fast-forward past connection timeout (10 seconds)
    await vi.advanceTimersByTimeAsync(10000)

    await waitFor(() => {
      expect(result.current.usingPolling).toBe(true)
    }, { timeout: 2000 })
  })

  it('should stop polling when WebSocket connects', async () => {
    const endpointId = 'test-endpoint-123'
    const { result } = renderHook(() => useWebSocket(endpointId))

    // Start with polling
    await vi.advanceTimersByTimeAsync(10000)

    await waitFor(() => {
      expect(result.current.usingPolling).toBe(true)
    })

    // Now simulate WebSocket connection
    await vi.runAllTimersAsync()

    await waitFor(() => {
      expect(result.current.connected).toBe(true)
      expect(result.current.usingPolling).toBe(false)
    })
  })

  it('should handle WebSocket errors gracefully', async () => {
    const endpointId = 'test-endpoint-123'
    const { result } = renderHook(() => useWebSocket(endpointId))

    await vi.runAllTimersAsync()

    const mockWs = getMockWebSocket()
    mockWs?.simulateError('Connection failed')

    // Should still be functional, possibly falling back to polling
    expect(result.current.sendMessage).toBeDefined()
  })
})
