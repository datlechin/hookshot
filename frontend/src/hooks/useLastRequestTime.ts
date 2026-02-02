import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

/**
 * Fetch the most recent request timestamp for each endpoint
 */
export function useLastRequestTime(endpointIds: string[]): Record<string, string | null> {
  const [lastRequestTimes, setLastRequestTimes] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (endpointIds.length === 0) return;

    const fetchLastRequestTimes = async () => {
      const times: Record<string, string | null> = {};

      await Promise.all(
        endpointIds.map(async (endpointId) => {
          try {
            const requests = await api.requests.list(endpointId);
            if (requests.length > 0) {
              // Requests are ordered by received_at DESC, so first is most recent
              times[endpointId] = requests[0].received_at;
            } else {
              times[endpointId] = null;
            }
          } catch (err) {
            console.error(`Failed to fetch last request time for ${endpointId}:`, err);
            times[endpointId] = null;
          }
        })
      );

      setLastRequestTimes(times);
    };

    fetchLastRequestTimes();
  }, [endpointIds.join(',')]); // Use join to create stable dependency

  return lastRequestTimes;
}
