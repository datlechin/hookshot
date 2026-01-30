/**
 * Custom hook for managing requests
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Request } from '@/lib/types'

export interface UseRequestsReturn {
  requests: Request[]
  loading: boolean
  error: Error | null
  clearRequests: () => Promise<void>
  deleteRequest: (requestId: number) => Promise<void>
  addRequest: (request: Request) => void
  reload: () => Promise<void>
}

/**
 * Hook for managing webhook requests for a specific endpoint
 */
export function useRequests(endpointId: string | null): UseRequestsReturn {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Load all requests for the endpoint
   */
  const loadRequests = useCallback(async () => {
    if (!endpointId) {
      setRequests([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await api.requests.list(endpointId)
      setRequests(data)
    } catch (err) {
      setError(err as Error)
      console.error('[useRequests] Failed to load requests:', err)
    } finally {
      setLoading(false)
    }
  }, [endpointId])

  /**
   * Clear all requests for the endpoint
   */
  const clearRequests = useCallback(async (): Promise<void> => {
    if (!endpointId) return

    setError(null)
    try {
      await api.requests.clear(endpointId)
      setRequests([])
    } catch (err) {
      setError(err as Error)
      console.error('[useRequests] Failed to clear requests:', err)
      throw err
    }
  }, [endpointId])

  /**
   * Delete a specific request
   */
  const deleteRequest = useCallback(
    async (requestId: number): Promise<void> => {
      if (!endpointId) return

      setError(null)
      try {
        await api.requests.delete(endpointId, requestId)
        setRequests((prev) => prev.filter((r) => r.id !== requestId))
      } catch (err) {
        setError(err as Error)
        console.error('[useRequests] Failed to delete request:', err)
        throw err
      }
    },
    [endpointId]
  )

  /**
   * Add a new request (from WebSocket)
   */
  const addRequest = useCallback((request: Request): void => {
    setRequests((prev) => [request, ...prev])
  }, [])

  // Load requests when endpoint changes
  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  return {
    requests,
    loading,
    error,
    clearRequests,
    deleteRequest,
    addRequest,
    reload: loadRequests,
  }
}
