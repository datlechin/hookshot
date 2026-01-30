import { X, FileText } from 'lucide-react';
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';

interface DetailPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * DetailPanel component for displaying request details
 * Width: 480px on desktop, full width on mobile
 * Collapsible/closable with X button
 */
export function DetailPanel({ isOpen = false, onClose }: DetailPanelProps) {
  // Placeholder - will be replaced with actual request data in later tasks
  const selectedRequest = null;

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="fixed inset-0 lg:relative lg:inset-auto w-full lg:w-[480px] bg-[var(--surface)] border-l border-[var(--border)] flex flex-col overflow-hidden z-40">
      {/* Header with close button */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Request Details</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close detail panel"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabbed interface placeholder - will be implemented in next task */}
      <div className="flex-shrink-0 flex items-center space-x-4 px-4 py-2 border-b border-[var(--border)] bg-[var(--background)]">
        <button className="px-3 py-1.5 text-sm font-medium text-[var(--accent-blue)] border-b-2 border-[var(--accent-blue)]">
          Overview
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          Headers
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          Body
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedRequest === null ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="No request selected"
            description="Select a request to view its details."
          />
        ) : (
          <div>
            {/* Request details will be rendered here in later tasks */}
          </div>
        )}
      </div>
    </aside>
  );
}
