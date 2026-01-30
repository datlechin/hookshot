import { useState, useMemo } from 'react';
import { Inbox } from 'lucide-react';
import { useRequests } from '@/hooks';
import type { HttpMethod, Request } from '@/lib/types';
import { RequestFilters } from '@/components/request/RequestFilters';
import { RequestSearch } from '@/components/request/RequestSearch';
import { VirtualRequestList } from '@/components/request/VirtualRequestList';
import { EmptyState } from '@/components/ui/EmptyState';

/**
 * RequestList component - middle panel showing captured webhook requests
 * Flexible width, takes remaining space between sidebar and detail panel
 */
export function RequestList() {
  // TODO: Get selectedEndpointId from context/state management
  const selectedEndpointId = null;
  const { requests, loading } = useRequests(selectedEndpointId);

  const [selectedMethods, setSelectedMethods] = useState<HttpMethod[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<number | undefined>();

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Filter by HTTP method
      if (selectedMethods.length > 0 && !selectedMethods.includes(req.method as HttpMethod)) {
        return false;
      }

      // Search in headers and body
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const inHeaders = JSON.stringify(req.headers).toLowerCase().includes(search);
        const inBody = req.body?.toLowerCase().includes(search);
        const inPath = req.path?.toLowerCase().includes(search);
        return inHeaders || inBody || inPath;
      }

      return true;
    });
  }, [requests, selectedMethods, searchQuery]);

  function handleRequestClick(request: Request) {
    setSelectedRequestId(request.id);
    // TODO: Open detail panel with request details
  }

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-[var(--background)]">
      {/* Header with filters and search */}
      <div className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Requests
            {filteredRequests.length !== requests.length && (
              <span className="ml-2 text-sm font-normal text-[var(--text-secondary)]">
                ({filteredRequests.length} of {requests.length})
              </span>
            )}
          </h2>
        </div>

        {/* Filters */}
        <RequestFilters selectedMethods={selectedMethods} onMethodsChange={setSelectedMethods} />

        {/* Search bar */}
        <RequestSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Scrollable list area */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[var(--text-secondary)]">Loading requests...</div>
          </div>
        ) : !selectedEndpointId ? (
          <EmptyState
            icon={<Inbox className="w-16 h-16" />}
            title="No endpoint selected"
            description="Select an endpoint from the sidebar to view requests."
          />
        ) : (
          <VirtualRequestList
            requests={filteredRequests}
            onRequestClick={handleRequestClick}
            selectedRequestId={selectedRequestId}
          />
        )}
      </div>
    </main>
  );
}
