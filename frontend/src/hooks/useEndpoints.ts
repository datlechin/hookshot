/**
 * Hook for managing endpoint state
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Endpoint, EndpointConfig } from '@/lib/types'
import { useMyEndpoints } from './useMyEndpoints'

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
  const [allEndpoints, setAllEndpoints] = useState<Endpoint[]>([])
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hasMigrated, setHasMigrated] = useState(false)

  const {
    myEndpointIds,
    claimEndpoint,
    unclaimEndpoint,
    cleanupStaleIds,
    claimAll,
  } = useMyEndpoints()

  // Fetch all endpoints from API
  const fetchEndpoints = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.endpoints.list()
      setAllEndpoints(data)

      // One-time migration: Auto-claim all existing endpoints on first load
      if (!hasMigrated && myEndpointIds.length === 0 && data.length > 0) {
        claimAll(data.map((e) => e.id))
        setHasMigrated(true)
      }

      // Cleanup stale endpoint IDs from localStorage
      cleanupStaleIds(data.map((e) => e.id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch endpoints'
      setError(message)
      console.error('Failed to fetch endpoints:', err)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - we'll call this manually, not react to changes

  // Filter endpoints whenever allEndpoints or myEndpointIds changes
  useEffect(() => {
    const filteredEndpoints = allEndpoints.filter((e) => myEndpointIds.includes(e.id))
    setEndpoints(filteredEndpoints)

    // Auto-select first endpoint if none selected OR if selected endpoint is no longer in list
    const selectedExists = selectedId && filteredEndpoints.some((e) => e.id === selectedId)
    if (!selectedExists && filteredEndpoints.length > 0) {
      setSelectedId(filteredEndpoints[0].id)
    } else if (!selectedExists && filteredEndpoints.length === 0) {
      setSelectedId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEndpoints, myEndpointIds]) // Don't include selectedId to avoid loop

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
      claimEndpoint(newEndpoint.id) // Auto-claim newly created endpoint

      // Update both allEndpoints and endpoints
      setAllEndpoints((prev) => [newEndpoint, ...prev])
      // No need to update endpoints here - the filter effect will handle it

      setSelectedId(newEndpoint.id)
      return newEndpoint
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create endpoint'
      setError(message)
      console.error('Failed to create endpoint:', err)
      return null
    }
  }, [claimEndpoint])

  const deleteEndpoint = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null)
        await api.endpoints.delete(id)
        unclaimEndpoint(id) // Remove from localStorage

        // Remove from allEndpoints
        setAllEndpoints((prev) => prev.filter((e) => e.id !== id))
        // The filter effect will update endpoints automatically

        // If deleted endpoint was selected, select first remaining
        if (selectedId === id) {
          // We need to wait for the filter effect to run
          // For now, just clear selection
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
    [selectedId, unclaimEndpoint]
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
