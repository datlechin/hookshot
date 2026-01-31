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
          'p-3 rounded-lg cursor-pointer transition-all group relative',
          selected
            ? 'bg-[var(--surface-hover)] border-l-4 border-[var(--accent-blue)] pl-2'
            : 'hover:bg-[var(--surface-hover)] border-l-4 border-transparent'
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
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-mono text-[var(--text-primary)] truncate">{endpoint.id}</p>
              {endpoint.custom_response_enabled && (
                <span
                  className="flex-shrink-0 w-2 h-2 bg-[var(--accent-green)] rounded-full"
                  title="Custom response enabled"
                />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-[var(--text-tertiary)]">
                {new Date(endpoint.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              {requestCount > 0 && (
                <>
                  <span className="text-xs text-[var(--text-tertiary)]">•</span>
                  <span className="text-xs px-1.5 py-0.5 bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] rounded font-medium">
                    {requestCount} {requestCount === 1 ? 'request' : 'requests'}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={handleConfigure}
              className="text-[var(--text-tertiary)] hover:text-[var(--accent-blue)] transition-colors opacity-0 group-hover:opacity-100"
              title="Configure response"
              aria-label="Configure response"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="text-[var(--text-tertiary)] hover:text-[var(--accent-red)] transition-colors opacity-0 group-hover:opacity-100"
              title="Delete endpoint"
              aria-label="Delete endpoint"
            >
              <Trash2 className="w-4 h-4" />
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
