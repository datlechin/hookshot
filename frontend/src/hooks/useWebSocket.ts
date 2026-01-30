/**
 * Custom hook for managing WebSocket connections
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { WebSocketClient } from '@/lib/websocket'
import type { WebSocketMessage } from '@/lib/types'

export interface UseWebSocketReturn {
  connected: boolean
  lastMessage: WebSocketMessage | null
  sendMessage: (data: unknown) => void
}

/**
 * Hook for managing WebSocket connection per endpoint
 */
export function useWebSocket(endpointId: string | null): UseWebSocketReturn {
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const clientRef = useRef<WebSocketClient | null>(null)

  /**
   * Send a message through the WebSocket
   */
  const sendMessage = useCallback((data: unknown) => {
    if (clientRef.current) {
      clientRef.current.send(data)
    }
  }, [])

  useEffect(() => {
    if (!endpointId) {
      setConnected(false)
      setLastMessage(null)
      return
    }

    // Determine WebSocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ws/${endpointId}`

    console.log('[useWebSocket] Connecting to', wsUrl)

    // Create WebSocket client
    const client = new WebSocketClient(wsUrl)
    clientRef.current = client

    // Subscribe to connection status
    const unsubscribeStatus = client.onStatusChange((status) => {
      setConnected(status)
    })

    // Connect and handle messages
    client.connect((message) => {
      setLastMessage(message)
    })

    // Cleanup on unmount or endpoint change
    return () => {
      console.log('[useWebSocket] Disconnecting from', wsUrl)
      unsubscribeStatus()
      client.disconnect()
      clientRef.current = null
      setConnected(false)
      setLastMessage(null)
    }
  }, [endpointId])

  return {
    connected,
    lastMessage,
    sendMessage,
  }
}
