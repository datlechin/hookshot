import type { Endpoint } from '@/lib/types';

/**
 * Extract request counts from endpoints
 * The backend already provides request_count in the Endpoint response
 */
export function useRequestCounts(endpoints: Endpoint[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const endpoint of endpoints) {
    counts[endpoint.id] = endpoint.request_count || 0;
  }

  return counts;
}
