/**
 * Custom hook for managing WebSocket connections with HTTP polling fallback
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { WebSocketClient } from '@/lib/websocket'
import { api } from '@/lib/api'
import type { WebSocketMessage, Request } from '@/lib/types'

export interface UseWebSocketReturn {
  connected: boolean
  lastMessage: WebSocketMessage | null
  sendMessage: (data: unknown) => void
  usingPolling: boolean
}

const POLLING_INTERVAL = 5000 // 5 seconds
const WS_CONNECTION_TIMEOUT = 10000 // 10 seconds before falling back to polling

/**
 * Hook for managing WebSocket connection per endpoint with HTTP polling fallback
 */
export function useWebSocket(endpointId: string | null): UseWebSocketReturn {
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [usingPolling, setUsingPolling] = useState(false)
  const clientRef = useRef<WebSocketClient | null>(null)
  const pollingIntervalRef = useRef<number | undefined>(undefined)
  const lastRequestIdRef = useRef<number>(0)
  const connectionTimeoutRef = useRef<number | undefined>(undefined)

  /**
   * Send a message through the WebSocket
   */
  const sendMessage = useCallback((data: unknown) => {
    if (clientRef.current) {
      clientRef.current.send(data)
    }
  }, [])

  /**
   * Start HTTP polling as fallback
   */
  const startPolling = useCallback(() => {
    if (!endpointId) return

    console.log('[useWebSocket] Starting HTTP polling fallback')
    setUsingPolling(true)

    const poll = async () => {
      try {
        const requests = await api.requests.list(endpointId)
        if (requests.length > 0 && requests[0].id > lastRequestIdRef.current) {
          // New request detected
          lastRequestIdRef.current = requests[0].id
          const message: WebSocketMessage = {
            type: 'new_request',
            data: requests[0],
          }
          setLastMessage(message)
        }
      } catch (error) {
        console.error('[useWebSocket] Polling error:', error)
      }
    }

    // Poll immediately and then set interval
    poll()
    pollingIntervalRef.current = window.setInterval(poll, POLLING_INTERVAL)
  }, [endpointId])

  /**
   * Stop HTTP polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('[useWebSocket] Stopping HTTP polling')
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = undefined
      setUsingPolling(false)
    }
  }, [])

  useEffect(() => {
    if (!endpointId) {
      setConnected(false)
      setLastMessage(null)
      stopPolling()
      return
    }

    // Determine WebSocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ws/${endpointId}`

    console.log('[useWebSocket] Attempting WebSocket connection to', wsUrl)

    // Create WebSocket client
    const client = new WebSocketClient(wsUrl)
    clientRef.current = client

    // Set timeout to fall back to polling if connection fails
    connectionTimeoutRef.current = window.setTimeout(() => {
      if (!client.isConnected) {
        console.log('[useWebSocket] WebSocket connection timeout, falling back to polling')
        startPolling()
      }
    }, WS_CONNECTION_TIMEOUT)

    // Subscribe to connection status
    const unsubscribeStatus = client.onStatusChange((status) => {
      setConnected(status)

      if (status) {
        // WebSocket connected successfully
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current)
        }
        stopPolling()
      } else {
        // WebSocket disconnected, fall back to polling
        if (!usingPolling) {
          startPolling()
        }
      }
    })

    // Connect and handle messages
    client.connect((message) => {
      setLastMessage(message)

      // Update last request ID if it's a new request
      if (message.type === 'new_request' && 'id' in message.data) {
        const request = message.data as Request
        if (request.id > lastRequestIdRef.current) {
          lastRequestIdRef.current = request.id
        }
      }
    })

    // Cleanup on unmount or endpoint change
    return () => {
      console.log('[useWebSocket] Cleaning up')
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
      unsubscribeStatus()
      client.disconnect()
      clientRef.current = null
      setConnected(false)
      setLastMessage(null)
      stopPolling()
    }
  }, [endpointId, startPolling, stopPolling, usingPolling])

  return {
    connected,
    lastMessage,
    sendMessage,
    usingPolling,
  }
}
