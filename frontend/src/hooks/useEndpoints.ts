import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { endpointsApi } from '@/lib/api';
import type { CreateEndpointRequest, UpdateEndpointRequest } from '@/types';

export function useEndpoints() {
  return useQuery({
    queryKey: ['endpoints'],
    queryFn: endpointsApi.list,
  });
}

export function useEndpoint(id: string | undefined) {
  return useQuery({
    queryKey: ['endpoint', id],
    queryFn: () => endpointsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateEndpoint() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateEndpointRequest) => endpointsApi.create(data),
    onSuccess: (endpoint) => {
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      navigate(`/endpoints/${endpoint.id}`);
    },
  });
}

export function useUpdateEndpoint(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEndpointRequest) => endpointsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoint', id] });
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
    },
  });
}

export function useDeleteEndpoint() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: string) => endpointsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      navigate('/');
    },
  });
}
