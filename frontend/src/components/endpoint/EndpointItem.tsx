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
}

export function EndpointItem({
  endpoint,
  selected,
  onSelect,
  onDelete,
  onConfigure,
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
          'p-3 rounded-lg cursor-pointer transition-colors group',
          selected
            ? 'bg-[var(--surface-hover)] border-l-2 border-[var(--accent-blue)]'
            : 'hover:bg-[var(--surface-hover)]'
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
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono text-[var(--text-primary)] truncate">
                {endpoint.id}
              </p>
              {endpoint.custom_response_enabled && (
                <span className="flex-shrink-0 w-2 h-2 bg-[var(--accent-green)] rounded-full" title="Custom response enabled" />
              )}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {new Date(endpoint.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
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
