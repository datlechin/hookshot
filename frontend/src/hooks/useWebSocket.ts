import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WebSocketClient, type WebSocketMessage } from '@/lib/websocket';
import type { Request } from '@/types';

export function useWebSocket(endpointId: string | undefined) {
  const [isConnected, setIsConnected] = useState(false);
  const [newRequests, setNewRequests] = useState<Request[]>([]);
  const [lastRequestTime, setLastRequestTime] = useState<Date | null>(null);
  const wsRef = useRef<WebSocketClient | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!endpointId) return;

    const ws = new WebSocketClient(endpointId);
    wsRef.current = ws;

    ws.connect();

    // Monitor connection state
    const checkConnection = setInterval(() => {
      setIsConnected(ws.isConnected());
    }, 1000);

    const unsubscribe = ws.onMessage((message: WebSocketMessage) => {
      if (message.type === 'new_request') {
        setNewRequests((prev) => [message.data, ...prev]);
        setLastRequestTime(new Date());

        // Invalidate requests query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['requests', endpointId] });
      }
    });

    return () => {
      clearInterval(checkConnection);
      unsubscribe();
      ws.disconnect();
      wsRef.current = null;
    };
  }, [endpointId, queryClient]);

  const clearNewRequests = useCallback(() => {
    setNewRequests([]);
    setLastRequestTime(null);
  }, []);

  return {
    isConnected,
    newRequests,
    lastRequestTime,
    clearNewRequests,
  };
}
