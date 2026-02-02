import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage endpoint custom names in localStorage
 */

const STORAGE_KEY = 'endpoint_custom_names';

type EndpointNames = Record<string, string>;

export function useEndpointNames() {
  const [names, setNames] = useState<EndpointNames>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    } catch (error) {
      console.error('Failed to save endpoint names to localStorage:', error);
    }
  }, [names]);

  const setCustomName = useCallback((endpointId: string, name: string) => {
    setNames((prev) => {
      if (name.trim() === '') {
        // Remove if empty
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [endpointId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [endpointId]: name.trim() };
    });
  }, []);

  const getCustomName = useCallback(
    (endpointId: string): string | undefined => {
      return names[endpointId];
    },
    [names]
  );

  const removeCustomName = useCallback((endpointId: string) => {
    setNames((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [endpointId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    names,
    customNames: names,
    setCustomName,
    getCustomName,
    removeCustomName,
  };
}
