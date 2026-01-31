import { MethodBadge } from '@/components/ui/MethodBadge'
import { RelativeTimestamp } from '@/components/ui/RelativeTimestamp'
import type { Request } from '@/lib/types'

interface RequestItemProps {
  request: Request
  onClick?: () => void
  isSelected?: boolean
  isNew?: boolean
}

/**
 * RequestItem - Individual request in the list
 * Shows method badge, path, timestamp, IP address, and body preview
 */
export function RequestItem({
  request,
  onClick,
  isSelected = false,
  isNew = false,
}: RequestItemProps) {
  const bodyPreview = request.body ? request.body.substring(0, 50).replace(/\n/g, ' ') : null

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 border-b border-(--border) hover:bg-(--surface) cursor-pointer transition-all ${
        isSelected ? 'bg-(--surface)' : ''
      } ${isNew ? 'animate-pulse-subtle bg-(--accent-blue)/10' : ''}`}
    >
      <div className="flex items-start gap-3">
        <MethodBadge method={request.method} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-(--text-primary) truncate font-mono">
            {request.path}
            {request.query_string && (
              <span className="text-(--text-tertiary)">?{request.query_string}</span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-(--text-secondary)">
              <RelativeTimestamp date={request.received_at} />
            </p>
            {request.content_type && (
              <span className="text-xs px-1.5 py-0.5 bg-(--surface-hover) border border-(--border) rounded text-(--text-tertiary) font-mono">
                {request.content_type.split(';')[0]}
              </span>
            )}
          </div>
          {bodyPreview && (
            <p className="text-xs text-(--text-tertiary) mt-1 truncate font-mono">
              {bodyPreview}
              {request.body && request.body.length > 50 && '...'}
            </p>
          )}
        </div>
        <p className="text-xs text-(--text-tertiary) font-mono shrink-0">{request.ip_address}</p>
      </div>
    </div>
  )
}
