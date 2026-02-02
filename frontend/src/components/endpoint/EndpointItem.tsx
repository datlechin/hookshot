import { useState } from 'react'
import { Trash2, Settings, Circle, Copy, Check } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Badge } from '@/components/ui/Badge'
import { EndpointNameEditor } from '@/components/endpoint/EndpointNameEditor'
import type { Endpoint } from '@/lib/types'
import { cn, focusRing } from '@/lib/utils'
import { formatRelativeTime, formatRequestCount } from '@/utils/formatters'

/**
 * EndpointItem variant definitions - Compact & minimal design
 */
const endpointItemVariants = cva(
  'group relative rounded-md transition-all cursor-pointer',
  {
    variants: {
      selected: {
        true: 'bg-(--surface-hover)',
        false: 'hover:bg-(--surface-hover)',
      },
      compact: {
        true: 'p-2',
        false: 'p-2.5',
      },
    },
    defaultVariants: {
      selected: false,
      compact: false,
    },
  }
)

/**
 * Action button variants
 */
const actionButtonVariants = cva(
  'p-1 transition-all rounded focus:outline-none',
  {
    variants: {
      variant: {
        default: 'text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--surface)',
        danger: 'text-(--text-tertiary) hover:text-(--accent-red) hover:bg-(--accent-red)/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

/**
 * EndpointItem - Main component
 * Compact design with minimal spacing
 */
interface EndpointItemProps extends VariantProps<typeof endpointItemVariants> {
  endpoint: Endpoint
  selected: boolean
  onSelect: () => void
  onDelete: () => void
  onConfigure: () => void
  customName?: string
  onSetCustomName: (name: string) => void
  lastRequestTime?: string | null
}

export function EndpointItem({
  endpoint,
  selected,
  onSelect,
  onDelete,
  onConfigure,
  customName,
  onSetCustomName,
  lastRequestTime,
  compact = false,
}: EndpointItemProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const requestCount = endpoint.request_count || 0

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    const url = `${window.location.origin}/${endpoint.id}`

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    <>
      <div className={cn(endpointItemVariants({ selected, compact }))}>
        {/* Invisible overlay button for selection - positioned behind interactive elements */}
        <button
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0 border-none bg-transparent p-0 m-0"
          onClick={onSelect}
          onKeyDown={handleKeyDown}
          aria-label={`Select endpoint ${customName || endpoint.id}`}
          aria-pressed={selected}
          type="button"
        />

        {/* Main row: Name + Badge + Indicator + Actions */}
        <div className="flex items-center justify-between gap-2 mb-1 relative pointer-events-none">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 relative z-10 pointer-events-auto">
            {/* Endpoint Name */}
            <EndpointNameEditor
              endpointId={endpoint.id}
              currentName={customName}
              defaultName={endpoint.id.substring(0, 8)}
              onSave={onSetCustomName}
            />

            {/* Request Count Badge */}
            {requestCount > 0 && (
              <Badge variant="default" size="sm">
                {formatRequestCount(requestCount)}
              </Badge>
            )}

            {/* Custom Response Indicator */}
            {endpoint.custom_response_enabled && (
              <span title="Custom response enabled">
                <Circle className="w-2 h-2 fill-(--accent-green) text-(--accent-green)" />
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 relative z-10 pointer-events-auto">
            <button
              onClick={handleCopy}
              className={cn(
                actionButtonVariants({ variant: 'default' }),
                focusRing,
                copied && 'text-(--accent-green)'
              )}
              title={copied ? 'Copied!' : 'Copy URL'}
              aria-label={copied ? 'Copied webhook URL' : 'Copy webhook URL'}
              type="button"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleConfigure}
              className={cn(actionButtonVariants({ variant: 'default' }), focusRing)}
              title="Configure"
              aria-label="Configure response"
              type="button"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className={cn(actionButtonVariants({ variant: 'danger' }), focusRing)}
              title="Delete"
              aria-label="Delete endpoint"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Metadata line */}
        <div className="flex items-center gap-2 text-[11px] text-(--text-tertiary) relative z-10">
          <span className="font-mono truncate">{endpoint.id}</span>
          {lastRequestTime && (
            <>
              <span>•</span>
              <span className="shrink-0">{formatRelativeTime(lastRequestTime)}</span>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
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
