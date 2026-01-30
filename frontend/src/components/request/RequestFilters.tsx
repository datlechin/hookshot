import { Filter } from 'lucide-react';
import type { HttpMethod } from '@/lib/types';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

interface RequestFiltersProps {
  selectedMethods: HttpMethod[];
  onMethodsChange: (methods: HttpMethod[]) => void;
}

/**
 * RequestFilters - Multi-select filter for HTTP methods
 */
export function RequestFilters({ selectedMethods, onMethodsChange }: RequestFiltersProps) {
  function toggleMethod(method: HttpMethod) {
    const methods = selectedMethods.includes(method)
      ? selectedMethods.filter((m) => m !== method)
      : [...selectedMethods, method];
    onMethodsChange(methods);
  }

  function clearFilters() {
    onMethodsChange([]);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
        <Filter className="w-4 h-4" />
        <span>Method:</span>
      </div>
      {METHODS.map((method) => (
        <button
          key={method}
          onClick={() => toggleMethod(method)}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            selectedMethods.includes(method)
              ? 'bg-[var(--accent-blue)] text-white'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)]'
          }`}
        >
          {method}
        </button>
      ))}
      {selectedMethods.length > 0 && (
        <button
          onClick={clearFilters}
          className="text-xs text-[var(--accent-red)] hover:underline ml-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
