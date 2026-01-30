import { MethodBadge } from '@/components/ui/MethodBadge';
import { RelativeTimestamp } from '@/components/ui/RelativeTimestamp';
import type { Request } from '@/lib/types';

interface RequestItemProps {
  request: Request;
  onClick?: () => void;
  isSelected?: boolean;
  isNew?: boolean;
}

/**
 * RequestItem - Individual request in the list
 * Shows method badge, path, timestamp, and IP address
 */
export function RequestItem({ request, onClick, isSelected = false, isNew = false }: RequestItemProps) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--surface)] cursor-pointer transition-all ${
        isSelected ? 'bg-[var(--surface)]' : ''
      } ${isNew ? 'animate-pulse-subtle bg-[var(--accent-blue)]/10' : ''}`}
    >
      <div className="flex items-center gap-3">
        <MethodBadge method={request.method} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-primary)] truncate font-mono">
            {request.path}
            {request.query_string && (
              <span className="text-[var(--text-tertiary)]">?{request.query_string}</span>
            )}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            <RelativeTimestamp date={request.received_at} />
          </p>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] font-mono">{request.ip_address}</p>
      </div>
    </div>
  );
}
