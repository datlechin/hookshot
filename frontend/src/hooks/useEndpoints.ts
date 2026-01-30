/**
 * Hook for managing endpoint state
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
}

export function useEndpoints(): UseEndpointsReturn {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const refreshEndpoints = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.endpoints.list()
      setEndpoints(data)

      // Auto-select first endpoint if none selected
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch endpoints'
      setError(message)
      console.error('Failed to fetch endpoints:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    refreshEndpoints()
  }, [refreshEndpoints])

  const createEndpoint = useCallback(async (): Promise<Endpoint | null> => {
    try {
      setError(null)
      const newEndpoint = await api.endpoints.create()
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

  const deleteEndpoint = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null)
      await api.endpoints.delete(id)

      // Remove from local state
      setEndpoints((prev) => prev.filter((e) => e.id !== id))

      // If deleted endpoint was selected, select first remaining
      if (selectedId === id) {
        setEndpoints((prev) => {
          setSelectedId(prev.length > 0 ? prev[0].id : null)
          return prev
        })
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete endpoint'
      setError(message)
      console.error('Failed to delete endpoint:', err)
      return false
    }
  }, [selectedId])

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
  }
}
