/**
 * HeadersTab component - displays request headers with filtering and copy functionality
 */

import { useState } from 'react';
import { CopyButton } from '@/components/ui';
import { Search } from 'lucide-react';

interface HeadersTabProps {
  headers: Record<string, string>;
}

export function HeadersTab({ headers }: HeadersTabProps) {
  const [filter, setFilter] = useState('');

  const filteredHeaders = Object.entries(headers).filter(([key]) =>
    key.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Search Input */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
        <input
          type="text"
          placeholder="Filter headers..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent"
        />
      </div>

      {/* Headers Count */}
      <div className="mb-3 text-xs text-[var(--text-secondary)]">
        {filteredHeaders.length} {filteredHeaders.length === 1 ? 'header' : 'headers'}
        {filter && ` matching "${filter}"`}
      </div>

      {/* Headers List */}
      {filteredHeaders.length === 0 ? (
        <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
          No headers found
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHeaders.map(([key, value]) => (
            <HeaderRow key={key} name={key} value={value} />
          ))}
        </div>
      )}

      {/* Copy All Button */}
      {Object.keys(headers).length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <CopyButton
            text={Object.entries(headers)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')}
            label="Copy All Headers"
          />
        </div>
      )}
    </div>
  );
}

interface HeaderRowProps {
  name: string;
  value: string;
}

function HeaderRow({ name, value }: HeaderRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isTruncated = value.length > 100;
  const displayValue = isTruncated && !isExpanded ? value.substring(0, 100) + '...' : value;

  return (
    <div className="bg-[var(--background)] border border-[var(--border)] rounded p-3 hover:bg-[var(--surface)] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-[var(--text-secondary)] mb-1">{name}</div>
          <div className="text-sm font-mono text-[var(--text-primary)] break-all">
            {displayValue}
          </div>
          {isTruncated && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-xs text-[var(--accent-blue)] hover:underline"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        <CopyButton text={value} label="" className="flex-shrink-0" />
      </div>
    </div>
  );
}
