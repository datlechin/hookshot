import { Webhook } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

/**
 * Sidebar component for displaying endpoint list
 * Width: 280px on desktop, collapsible on tablet, hidden on mobile
 */
export function Sidebar() {
  // Placeholder - will be replaced with actual endpoint data in later tasks
  const endpoints: never[] = [];

  return (
    <aside className="hidden lg:block w-[280px] bg-[var(--surface)] border-r border-[var(--border)] overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
          Endpoints
        </h2>

        {endpoints.length === 0 ? (
          <EmptyState
            icon={<Webhook className="w-12 h-12" />}
            title="No endpoints yet"
            description="Create one to get started."
          />
        ) : (
          <div className="space-y-2">
            {/* Endpoint list will be rendered here in later tasks */}
          </div>
        )}
      </div>
    </aside>
  );
}
