import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Inbox } from 'lucide-react';
import { RequestItem } from './RequestItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { groupRequestsByTime } from '@/lib/utils';
import type { Request } from '@/lib/types';

interface VirtualRequestListProps {
  requests: Request[];
  onRequestClick?: (request: Request) => void;
  selectedRequestId?: number;
  newRequestIds?: Set<number>;
  enableTimeGrouping?: boolean;
}

/**
 * VirtualRequestList - Virtualized list of webhook requests
 * Uses @tanstack/react-virtual for efficient rendering of large lists (1000+ items)
 * Supports optional time-based grouping
 */
export function VirtualRequestList({
  requests,
  onRequestClick,
  selectedRequestId,
  newRequestIds = new Set(),
  enableTimeGrouping = true,
}: VirtualRequestListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Group requests by time if enabled
  const groups = useMemo(() => {
    if (!enableTimeGrouping) {
      return [{ label: '', requests }];
    }
    return groupRequestsByTime(requests);
  }, [requests, enableTimeGrouping]);

  // Flatten groups into items with group headers
  const items = useMemo(() => {
    const result: Array<{ type: 'header'; label: string } | { type: 'request'; request: Request }> = [];
    for (const group of groups) {
      if (enableTimeGrouping && group.label) {
        result.push({ type: 'header', label: group.label });
      }
      for (const request of group.requests) {
        result.push({ type: 'request', request });
      }
    }
    return result;
  }, [groups, enableTimeGrouping]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = items[index];
      return item.type === 'header' ? 40 : 72; // Headers are 40px, requests are 72px
    },
    overscan: 5,
  });

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="w-16 h-16" />}
        title="No requests found"
        description="No requests match your filters."
      />
    );
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];

          return (
            <div
              key={virtualRow.index}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {item.type === 'header' ? (
                <div className="px-4 py-2 bg-[var(--surface-hover)] sticky top-0 z-10">
                  <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    {item.label}
                  </h3>
                </div>
              ) : (
                <RequestItem
                  request={item.request}
                  onClick={() => onRequestClick?.(item.request)}
                  isSelected={item.request.id === selectedRequestId}
                  isNew={newRequestIds.has(item.request.id)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
