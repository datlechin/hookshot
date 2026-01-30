import { Search, Filter, Inbox } from 'lucide-react';
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';

/**
 * RequestList component - middle panel showing captured webhook requests
 * Flexible width, takes remaining space between sidebar and detail panel
 */
export function RequestList() {
  // Placeholder - will be replaced with actual request data in later tasks
  const requests: never[] = [];

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-[var(--background)]">
      {/* Header with filters and search */}
      <div className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Requests</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" aria-label="Filter requests">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search bar placeholder */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Scrollable list area */}
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-16 h-16" />}
            title="No requests captured"
            description="Waiting for webhooks..."
          />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {/* Request items will be rendered here in later tasks */}
          </div>
        )}
      </div>
    </main>
  );
}
