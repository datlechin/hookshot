import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsApi } from '@/lib/api';

export function useRequests(endpointId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: ['requests', endpointId, limit],
    queryFn: async () => {
      const requests = await requestsApi.list(endpointId!);
      return limit ? requests.slice(0, limit) : requests;
    },
    enabled: !!endpointId,
  });
}

export function useRequest(endpointId: string, requestId: string) {
  return useQuery({
    queryKey: ['request', endpointId, requestId],
    queryFn: () => requestsApi.get(endpointId, requestId),
  });
}

export function useDeleteRequest(endpointId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => requestsApi.delete(endpointId, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', endpointId] });
    },
  });
}
