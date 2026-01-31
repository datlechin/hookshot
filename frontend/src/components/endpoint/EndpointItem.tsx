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
          'p-2 rounded transition-all group relative',
          selected
            ? 'bg-(--surface-hover) border-l-3 border-(--accent-blue) pl-1.5'
            : 'hover:bg-(--surface-hover) border-l-3 border-transparent'
        )}
      >
        <button
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0 border-none bg-transparent p-0 m-0"
          onClick={onSelect}
          aria-label={`Select endpoint ${endpoint.id}`}
          tabIndex={0}
        />

        <div className="flex items-start justify-between mb-1 relative pointer-events-none">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-xs font-mono text-(--text-primary) truncate">{endpoint.id}</p>
              {endpoint.custom_response_enabled && (
                <span
                  className="shrink-0 w-2 h-2 bg-(--accent-green) rounded-full"
                  title="Custom response enabled"
                />
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {requestCount > 0 && (
                <span className="text-[11px] px-1 py-0.5 bg-(--accent-blue)/10 text-(--accent-blue) rounded font-medium">
                  {requestCount}
                </span>
              )}
              <p className="text-[11px] text-(--text-tertiary)">
                {new Date(endpoint.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-0.5 ml-1.5 relative z-10 pointer-events-auto">
            <button
              onClick={handleConfigure}
              className="p-0.5 text-(--text-tertiary) hover:text-(--accent-blue) transition-colors opacity-0 group-hover:opacity-100"
              title="Configure"
              aria-label="Configure response"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-0.5 text-(--text-tertiary) hover:text-(--accent-red) transition-colors opacity-0 group-hover:opacity-100"
              title="Delete"
              aria-label="Delete endpoint"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity relative z-10 pointer-events-auto">
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
