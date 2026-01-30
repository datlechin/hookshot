/**
 * Custom hook for syncing state with localStorage
 */

import { useState, useEffect } from 'react'

/**
 * Hook for persisting state to localStorage
 * @param key - localStorage key
 * @param initialValue - default value if key doesn't exist
 * @returns Tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with value from localStorage or initial value
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('[useLocalStorage] Error reading from localStorage:', error)
      return initialValue
    }
  })

  // Update localStorage when value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('[useLocalStorage] Error writing to localStorage:', error)
    }
  }, [key, value])

  // Return same API as useState
  return [value, setValue]
}
