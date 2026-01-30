import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Inbox } from 'lucide-react';
import { RequestItem } from './RequestItem';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Request } from '@/lib/types';

interface VirtualRequestListProps {
  requests: Request[];
  onRequestClick?: (request: Request) => void;
  selectedRequestId?: number;
}

/**
 * VirtualRequestList - Virtualized list of webhook requests
 * Uses @tanstack/react-virtual for efficient rendering of large lists (1000+ items)
 */
export function VirtualRequestList({
  requests,
  onRequestClick,
  selectedRequestId,
}: VirtualRequestListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: requests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated height of each request item
    overscan: 5, // Render 5 extra items above and below viewport
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
          const request = requests[virtualRow.index];
          return (
            <div
              key={request.id}
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
              <RequestItem
                request={request}
                onClick={() => onRequestClick?.(request)}
                isSelected={request.id === selectedRequestId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
