/**
 * Hook for managing claimed endpoint IDs in localStorage
 * Implements session-based privacy where users only see endpoints they created or accessed
 */

import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

const STORAGE_KEY = 'hookshot_my_endpoints'

export interface UseMyEndpointsReturn {
  myEndpointIds: string[]
  claimEndpoint: (id: string) => void
  unclaimEndpoint: (id: string) => void
  isEndpointClaimed: (id: string) => boolean
  claimAll: (ids: string[]) => void
  cleanupStaleIds: (validIds: string[]) => void
}

/**
 * Custom hook for managing endpoint ownership via localStorage
 *
 * This enables privacy by only showing endpoints that:
 * - User created themselves
 * - User accessed via direct URL (/endpoint/{uuid})
 *
 * @returns Functions for claiming/unclaiming endpoints and checking ownership
 */
export function useMyEndpoints(): UseMyEndpointsReturn {
  const [myEndpointIds, setMyEndpointIds] = useLocalStorage<string[]>(STORAGE_KEY, [])

  /**
   * Claim ownership of an endpoint (add to localStorage)
   */
  const claimEndpoint = useCallback(
    (id: string) => {
      setMyEndpointIds((prev) => {
        // Don't add duplicates
        if (prev.includes(id)) {
          return prev
        }
        return [...prev, id]
      })
    },
    [setMyEndpointIds]
  )

  /**
   * Remove ownership of an endpoint (remove from localStorage)
   */
  const unclaimEndpoint = useCallback(
    (id: string) => {
      setMyEndpointIds((prev) => prev.filter((endpointId) => endpointId !== id))
    },
    [setMyEndpointIds]
  )

  /**
   * Check if user has claimed this endpoint
   */
  const isEndpointClaimed = useCallback(
    (id: string): boolean => {
      return myEndpointIds.includes(id)
    },
    [myEndpointIds]
  )

  /**
   * Claim multiple endpoints at once (used for migration)
   */
  const claimAll = useCallback(
    (ids: string[]) => {
      setMyEndpointIds((prev) => {
        // Merge with existing, remove duplicates
        const combined = [...prev, ...ids]
        const unique = Array.from(new Set(combined))

        // Only update if something actually changed
        if (unique.length === prev.length) {
          return prev
        }
        return unique
      })
    },
    [setMyEndpointIds]
  )

  /**
   * Remove endpoint IDs that no longer exist in the backend
   * This prevents localStorage from accumulating stale IDs
   */
  const cleanupStaleIds = useCallback(
    (validIds: string[]) => {
      setMyEndpointIds((prev) => {
        const validSet = new Set(validIds)
        const filtered = prev.filter((id) => validSet.has(id))

        // Only update if something was actually removed
        if (filtered.length === prev.length) {
          return prev
        }
        return filtered
      })
    },
    [setMyEndpointIds]
  )

  return {
    myEndpointIds,
    claimEndpoint,
    unclaimEndpoint,
    isEndpointClaimed,
    claimAll,
    cleanupStaleIds,
  }
}
