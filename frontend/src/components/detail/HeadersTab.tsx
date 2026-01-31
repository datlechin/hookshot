import { useState } from 'react'
import { CopyButton } from '@/components/ui'
import { Search } from 'lucide-react'

interface HeadersTabProps {
  headers: Record<string, string>
}

export function HeadersTab({ headers }: HeadersTabProps) {
  const [filter, setFilter] = useState('')

  const filteredHeaders = Object.entries(headers).filter(([key]) =>
    key.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="p-4">
      {/* Search Input */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-(--text-secondary)" />
        <input
          type="text"
          placeholder="Filter headers..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-(--background) border border-(--border) rounded text-sm text-(--text-primary) placeholder-(--text-secondary) focus:outline-none focus:ring-2 focus:ring-(--accent-blue) focus:border-transparent"
        />
      </div>

      {/* Headers Count */}
      <div className="mb-3 text-xs text-(--text-secondary)">
        {filteredHeaders.length} {filteredHeaders.length === 1 ? 'header' : 'headers'}
        {filter && ` matching "${filter}"`}
      </div>

      {/* Headers List */}
      {filteredHeaders.length === 0 ? (
        <div className="text-center py-8 text-sm text-(--text-secondary)">No headers found</div>
      ) : (
        <div className="space-y-2">
          {filteredHeaders.map(([key, value]) => (
            <HeaderRow key={key} name={key} value={value} />
          ))}
        </div>
      )}

      {/* Copy All Button */}
      {Object.keys(headers).length > 0 && (
        <div className="mt-4 pt-4 border-t border-(--border)">
          <CopyButton
            text={Object.entries(headers)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')}
            label="Copy All Headers"
          />
        </div>
      )}
    </div>
  )
}

interface HeaderRowProps {
  name: string
  value: string
}

function HeaderRow({ name, value }: HeaderRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isTruncated = value.length > 100
  const displayValue = isTruncated && !isExpanded ? value.substring(0, 100) + '...' : value

  return (
    <div className="bg-(--background) border border-(--border) rounded p-3 hover:bg-(--surface) transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-(--text-secondary) mb-1">{name}</div>
          <div className="text-sm font-mono text-(--text-primary) break-all">{displayValue}</div>
          {isTruncated && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-xs text-(--accent-blue) hover:underline"
              aria-label={
                isExpanded ? `Show less of ${name} header` : `Show more of ${name} header`
              }
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        <CopyButton text={value} label="" aria-label={`Copy ${name} header`} className="shrink-0" />
      </div>
    </div>
  )
}
