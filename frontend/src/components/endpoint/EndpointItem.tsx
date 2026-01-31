/**
 * Individual endpoint item component
 * Displays endpoint info with delete and copy actions
 */

import { useState } from 'react'
import { Trash2, Settings } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CopyURLButton } from '@/components/ui/CopyURLButton'
import type { Endpoint } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EndpointItemProps {
  endpoint: Endpoint
  selected: boolean
  onSelect: () => void
  onDelete: () => void
  onConfigure: () => void
  requestCount?: number
}

export function EndpointItem({
  endpoint,
  selected,
  onSelect,
  onDelete,
  onConfigure,
  requestCount = 0,
}: EndpointItemProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setShowConfirm(true)
  }

  function handleConfigure(e: React.MouseEvent) {
    e.stopPropagation()
    onConfigure()
  }

  function handleConfirm() {
    setShowConfirm(false)
    onDelete()
  }

  return (
    <>
      <div
        className={cn(
          'p-2 rounded cursor-pointer transition-all group relative',
          selected
            ? 'bg-[var(--surface-hover)] border-l-3 border-[var(--accent-blue)] pl-1.5'
            : 'hover:bg-[var(--surface-hover)] border-l-3 border-transparent'
        )}
        onClick={onSelect}
        role="button"
        tabIndex={0}
        aria-label={`Select endpoint ${endpoint.id}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect()
          }
        }}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-xs font-mono text-[var(--text-primary)] truncate">{endpoint.id}</p>
              {endpoint.custom_response_enabled && (
                <span
                  className="flex-shrink-0 w-2 h-2 bg-[var(--accent-green)] rounded-full"
                  title="Custom response enabled"
                />
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {requestCount > 0 && (
                <span className="text-[11px] px-1 py-0.5 bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] rounded font-medium">
                  {requestCount}
                </span>
              )}
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {new Date(endpoint.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-0.5 ml-1.5">
            <button
              onClick={handleConfigure}
              className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--accent-blue)] transition-colors opacity-0 group-hover:opacity-100"
              title="Configure"
              aria-label="Configure response"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--accent-red)] transition-colors opacity-0 group-hover:opacity-100"
              title="Delete"
              aria-label="Delete endpoint"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyURLButton endpointId={endpoint.id} />
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Delete Endpoint?"
          message="This will permanently delete this endpoint and all its webhook requests. This action cannot be undone."
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}
