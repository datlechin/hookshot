/**
 * Hook for managing endpoint state
 * Now fully relies on backend session-based filtering
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Endpoint, EndpointConfig } from '@/lib/types'

interface UseEndpointsReturn {
  endpoints: Endpoint[]
  loading: boolean
  error: string | null
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  createEndpoint: () => Promise<Endpoint | null>
  deleteEndpoint: (id: string) => Promise<boolean>
  updateConfig: (id: string, config: EndpointConfig) => Promise<Endpoint | null>
  refreshEndpoints: () => Promise<void>
  claimEndpoint: (id: string) => void
}

export function useEndpoints(): UseEndpointsReturn {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Fetch endpoints from API (backend filters by session)
  const fetchEndpoints = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.endpoints.list()
      setEndpoints(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch endpoints'
      setError(message)
      console.error('Failed to fetch endpoints:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-select first endpoint when endpoints change
  useEffect(() => {
    const selectedExists = selectedId && endpoints.some((e) => e.id === selectedId)
    if (!selectedExists && endpoints.length > 0) {
      setSelectedId(endpoints[0].id)
    } else if (!selectedExists && endpoints.length === 0) {
      setSelectedId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoints]) // Don't include selectedId to avoid loop

  // Fetch endpoints on mount only
  useEffect(() => {
    fetchEndpoints()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // refreshEndpoints just calls fetchEndpoints
  const refreshEndpoints = useCallback(async () => {
    await fetchEndpoints()
  }, [fetchEndpoints])

  const createEndpoint = useCallback(async (): Promise<Endpoint | null> => {
    try {
      setError(null)
      const newEndpoint = await api.endpoints.create()

      // Update endpoints state immediately
      setEndpoints((prev) => [newEndpoint, ...prev])
      setSelectedId(newEndpoint.id)
      return newEndpoint
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create endpoint'
      setError(message)
      console.error('Failed to create endpoint:', err)
      return null
    }
  }, [])

  const deleteEndpoint = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null)
        await api.endpoints.delete(id)

        // Remove from state
        setEndpoints((prev) => prev.filter((e) => e.id !== id))

        // If deleted endpoint was selected, clear selection
        if (selectedId === id) {
          setSelectedId(null)
        }

        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete endpoint'
        setError(message)
        console.error('Failed to delete endpoint:', err)
        return false
      }
    },
    [selectedId]
  )

  const updateConfig = useCallback(
    async (id: string, config: EndpointConfig): Promise<Endpoint | null> => {
      try {
        setError(null)
        const updated = await api.endpoints.updateConfig(id, config)
        setEndpoints((prev) => prev.map((e) => (e.id === id ? updated : e)))
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update endpoint'
        setError(message)
        console.error('Failed to update endpoint:', err)
        return null
      }
    },
    []
  )

  // claimEndpoint is now a no-op since backend handles session claiming
  const claimEndpoint = useCallback((id: string) => {
    // Backend automatically claims endpoints when they're accessed
    // This function kept for API compatibility but does nothing
    console.log('Endpoint auto-claimed by backend:', id)
  }, [])

  return {
    endpoints,
    loading,
    error,
    selectedId,
    setSelectedId,
    createEndpoint,
    deleteEndpoint,
    updateConfig,
    refreshEndpoints,
    claimEndpoint,
  }
}
