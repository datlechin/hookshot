import { useState, useMemo, useDeferredValue, useEffect } from 'react';
import type { Endpoint } from '@/lib/types';

const STORAGE_KEY_SORT = 'sidebar_sort';

export type SortOption = 'created-desc' | 'created-asc' | 'requests-desc' | 'requests-asc';

interface UseSidebarFiltersOptions {
  customNames: Record<string, string>;
}

export function useSidebarFilters(endpoints: Endpoint[], options: UseSidebarFiltersOptions) {
  const { customNames } = options;

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Sort state (persisted)
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SORT);
      return (stored as SortOption) || 'created-desc';
    } catch {
      return 'created-desc';
    }
  });

  // Persist sort to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SORT, sortBy);
    } catch (error) {
      console.error('Failed to save sort preference:', error);
    }
  }, [sortBy]);

  // Filter and sort endpoints
  const filteredAndSortedEndpoints = useMemo(() => {
    let result = [...endpoints];

    // Filter by search term (match UUID or custom name)
    if (deferredSearchTerm.trim()) {
      const term = deferredSearchTerm.toLowerCase().trim();
      result = result.filter((endpoint) => {
        const customName = customNames[endpoint.id]?.toLowerCase() || '';
        const uuid = endpoint.id.toLowerCase();
        return customName.includes(term) || uuid.includes(term);
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'created-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'requests-desc':
          return (b.request_count || 0) - (a.request_count || 0);
        case 'requests-asc':
          return (a.request_count || 0) - (b.request_count || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [endpoints, deferredSearchTerm, sortBy, customNames]);

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredAndSortedEndpoints,
  };
}
