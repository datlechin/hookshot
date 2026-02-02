import { Loader2, Webhook } from 'lucide-react';
import { EmptyState, Button } from '@/components/ui';
import { EndpointItem } from '@/components/endpoint';
import type { Endpoint } from '@/lib/types';

interface EndpointListProps {
  endpoints: Endpoint[];
  loading: boolean;
  selectedEndpointId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onConfigure: (endpoint: Endpoint) => void;
  onCreateEndpoint: () => void;
  customNames: Record<string, string>;
  onSetCustomName: (endpointId: string, name: string) => void;
  lastRequestTimes: Record<string, string | null>;
  hasSearchResults: boolean;
}

export function EndpointList({
  endpoints,
  loading,
  selectedEndpointId,
  onSelect,
  onDelete,
  onConfigure,
  onCreateEndpoint,
  customNames,
  onSetCustomName,
  lastRequestTimes,
  hasSearchResults,
}: EndpointListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-(--text-tertiary)" />
      </div>
    );
  }

  if (endpoints.length === 0) {
    if (hasSearchResults) {
      // No results for search
      return (
        <div className="p-4">
          <EmptyState
            icon={<Webhook className="w-12 h-12" />}
            title="No matching endpoints"
            description="Try adjusting your search term or filters."
          />
        </div>
      );
    }

    // No endpoints at all
    return (
      <div className="p-4">
        <EmptyState
          icon={<Webhook className="w-12 h-12" />}
          title="No endpoints yet"
          description="Create a new endpoint or visit an endpoint URL to get started."
          action={
            <Button variant="primary" onClick={onCreateEndpoint}>
              Create Endpoint
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {endpoints
        .filter((endpoint) => endpoint && endpoint.id)
        .map((endpoint) => (
          <EndpointItem
            key={endpoint.id}
            endpoint={endpoint}
            selected={selectedEndpointId === endpoint.id}
            onSelect={() => onSelect(endpoint.id)}
            onDelete={() => onDelete(endpoint.id)}
            onConfigure={() => onConfigure(endpoint)}
            customName={customNames[endpoint.id]}
            onSetCustomName={(name) => onSetCustomName(endpoint.id, name)}
            lastRequestTime={lastRequestTimes[endpoint.id] || null}
          />
        ))}
    </div>
  );
}
