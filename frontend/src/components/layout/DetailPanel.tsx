import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { X, FileText } from 'lucide-react';
import { Button, MethodBadge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { DetailPanelSkeleton } from '@/components/ui/Skeleton';
import type { WebhookRequest } from '@/lib/types';
import { OverviewTab } from '@/components/detail/OverviewTab';
import { HeadersTab } from '@/components/detail/HeadersTab';
import { BodyTab } from '@/components/detail/BodyTab';
import { MetadataTab } from '@/components/detail/MetadataTab';
import { ExportMenu, type ExportMenuHandle } from '@/components/detail/ExportMenu';
import { animations } from '@/lib/transitions';
import type { DetailPanelHandle } from '@/App';

interface DetailPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  selectedRequest?: WebhookRequest | null;
  loading?: boolean;
}

/**
 * DetailPanel component for displaying request details
 * Width: 480px on desktop, full width on mobile
 * Collapsible/closable with X button and ESC key
 */
export const DetailPanel = forwardRef<DetailPanelHandle, DetailPanelProps>(({ isOpen = false, onClose, selectedRequest = null, loading = false }, ref) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'headers' | 'body' | 'metadata'>('overview');
  const exportMenuRef = useRef<ExportMenuHandle>(null);

  // Handle ESC key to close panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Reset to overview tab when request changes
  useEffect(() => {
    if (selectedRequest) {
      setActiveTab('overview');
    }
  }, [selectedRequest]);

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    copyAsCurl: () => {
      exportMenuRef.current?.copyAsCurl();
    },
    exportRequest: () => {
      exportMenuRef.current?.exportAsJson();
    },
  }));

  if (!isOpen) {
    return null;
  }

  return (
    <aside className={`fixed inset-0 lg:relative lg:inset-auto w-full lg:w-[480px] bg-[var(--surface)] border-l border-[var(--border)] flex flex-col z-40 ${animations.slideIn}`}>
      {loading ? (
        <>
          {/* Header with close button */}
          <div className="flex-shrink-0 flex items-center justify-between p-2 border-b border-[var(--border)]">
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
          <DetailPanelSkeleton />
        </>
      ) : selectedRequest ? (
        <>
          {/* Header with request info and actions */}
          <div className="flex-shrink-0 flex items-center justify-between p-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MethodBadge method={selectedRequest.method} />
              <div className="flex-1 min-w-0">
                <h2 className="text-xs font-medium text-[var(--text-primary)] truncate">
                  #{selectedRequest.id}
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)] truncate">
                  {selectedRequest.path}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ExportMenu ref={exportMenuRef} request={selectedRequest} />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close detail panel"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabbed interface */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="flex-shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="headers">
                Headers ({Object.keys(selectedRequest.headers).length})
              </TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            {/* Tab content with proper overflow handling */}
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="overview">
                <OverviewTab request={selectedRequest} />
              </TabsContent>
              <TabsContent value="headers">
                <HeadersTab headers={selectedRequest.headers} />
              </TabsContent>
              <TabsContent value="body">
                <BodyTab body={selectedRequest.body} contentType={selectedRequest.content_type} />
              </TabsContent>
              <TabsContent value="metadata">
                <MetadataTab request={selectedRequest} />
              </TabsContent>
            </div>
          </Tabs>
        </>
      ) : (
        <>
          {/* Header with close button */}
          <div className="flex-shrink-0 flex items-center justify-between p-2 border-b border-[var(--border)]">
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

          {/* Empty state */}
          <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
            <EmptyState
              icon={<FileText className="w-12 h-12" />}
              title="No request selected"
              description="Select a request to view its details."
            />
          </div>
        </>
      )}
    </aside>
  );
});

DetailPanel.displayName = 'DetailPanel';
