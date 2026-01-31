/**
 * WebSocket Mock for Testing
 * Provides a fake WebSocket implementation for tests
 */

import { vi } from 'vitest'
import type { WebSocketMessage } from '@/lib/types'

type EventHandler = (event: Event) => void

export class MockWebSocket {
  static instances: MockWebSocket[] = []
  static autoConnect = true

  url: string
  readyState: number = WebSocket.CONNECTING
  onopen: EventHandler | null = null
  onclose: EventHandler | null = null
  onerror: EventHandler | null = null
  onmessage: ((event: MessageEvent) => void) | null = null

  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)

    // Simulate connection opening after a tick if autoConnect is true
    if (MockWebSocket.autoConnect) {
      setTimeout(() => {
        this.readyState = WebSocket.OPEN
        if (this.onopen) {
          this.onopen(new Event('open'))
        }
      }, 0)
    }
  }

  // Helper to manually connect
  open() {
    this.readyState = WebSocket.OPEN
    if (this.onopen) {
      this.onopen(new Event('open'))
    }
  }

  send() {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open')
    }
    // Mock send - does nothing in tests
  }

  close(code?: number, reason?: string) {
    this.readyState = WebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }))
    }
  }

  // Helper to simulate receiving a message
  simulateMessage(message: WebSocketMessage) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', {
        data: JSON.stringify(message)
      }))
    }
  }

  // Helper to simulate error
  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }

  addEventListener(type: string, listener: EventListener) {
    if (type === 'open') this.onopen = listener as EventHandler
    if (type === 'close') this.onclose = listener as EventHandler
    if (type === 'error') this.onerror = listener as EventHandler
    if (type === 'message') this.onmessage = listener as (event: MessageEvent) => void
  }

  removeEventListener(type: string, listener: EventListener) {
    if (type === 'open' && this.onopen === listener) this.onopen = null
    if (type === 'close' && this.onclose === listener) this.onclose = null
    if (type === 'error' && this.onerror === listener) this.onerror = null
    if (type === 'message' && this.onmessage === listener) this.onmessage = null
  }

  // Static helper to get the last created instance
  static getLastInstance(): MockWebSocket | undefined {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1]
  }

  // Static helper to clear all instances
  static clearInstances() {
    MockWebSocket.instances = []
  }
}

/**
 * Setup WebSocket mock for tests
 */
export function setupWebSocketMock() {
  vi.stubGlobal('WebSocket', MockWebSocket)
  MockWebSocket.clearInstances()
  MockWebSocket.autoConnect = true
}

/**
 * Cleanup WebSocket mock after tests
 */
export function cleanupWebSocketMock() {
  MockWebSocket.clearInstances()
}

/**
 * Get the current mock WebSocket instance
 */
export function getMockWebSocket(): MockWebSocket | undefined {
  return MockWebSocket.getLastInstance()
}
