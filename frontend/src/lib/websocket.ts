/**
 * WebSocket client for real-time updates with auto-reconnect
 */

import type { WebSocketMessage } from './types'

type MessageHandler = (message: WebSocketMessage) => void
type StatusHandler = (connected: boolean) => void

/**
 * WebSocket client with exponential backoff reconnection
 */
export class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private messageHandlers: MessageHandler[] = []
  private statusHandlers: StatusHandler[] = []
  private reconnectAttempts = 0
  private maxReconnectDelay = 30000 // 30 seconds
  private reconnectTimer?: number
  private shouldReconnect = true

  constructor(url: string) {
    this.url = url
  }

  /**
   * Connect to WebSocket server
   */
  connect(onMessage?: MessageHandler, onStatusChange?: StatusHandler): void {
    if (onMessage) {
      this.messageHandlers.push(onMessage)
    }
    if (onStatusChange) {
      this.statusHandlers.push(onStatusChange)
    }

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to', this.url)
        this.reconnectAttempts = 0
        this.notifyStatus(true)
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.messageHandlers.forEach((handler) => handler(message))
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err)
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
      }

      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected')
        this.notifyStatus(false)
        if (this.shouldReconnect) {
          this.attemptReconnect()
        }
      }
    } catch (err) {
      console.error('[WebSocket] Failed to create connection:', err)
      if (this.shouldReconnect) {
        this.attemptReconnect()
      }
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.shouldReconnect = false
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.notifyStatus(false)
  }

  /**
   * Send data to WebSocket server
   */
  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('[WebSocket] Cannot send - not connected')
    }
  }

  /**
   * Subscribe to WebSocket messages
   */
  subscribe(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.push(handler)
    return () => {
      this.statusHandlers = this.statusHandlers.filter((h) => h !== handler)
    }
  }

  /**
   * Get current connection status
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Attempt to reconnect with exponential backoff
   * Delays: 1s, 2s, 4s, 8s, 16s, 30s (max)
   */
  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      return // Already scheduled
    }

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    )

    console.log(
      `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`
    )

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++
      this.reconnectTimer = undefined
      this.connect()
    }, delay)
  }

  /**
   * Notify all status handlers of connection state change
   */
  private notifyStatus(connected: boolean): void {
    this.statusHandlers.forEach((handler) => handler(connected))
  }
}
