import { Button } from '@/components/ui'
import { LoadingSpinner } from '@/components/ui/Loading'
import { SearchInput } from '@/components/ui/SearchInput'
import { SortDropdown } from '@/components/ui/SortDropdown'
import type { SortOption } from '@/hooks/useSidebarFilters'

interface SidebarHeaderProps {
  endpointCount: number
  onCreateEndpoint: () => void
  creating: boolean
  searchTerm: string
  onSearchChange: (term: string) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  error?: string | null
  urlValidationError?: string | null
}

export function SidebarHeader({
  onCreateEndpoint,
  creating,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  error,
  urlValidationError,
}: SidebarHeaderProps) {
  return (
    <div className="p-2 border-b border-(--border) space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={onCreateEndpoint} disabled={creating}>
            {creating ? <LoadingSpinner size="sm" /> : 'New'}
          </Button>
        </div>
        <SortDropdown value={sortBy} onChange={onSortChange} />
      </div>

      <SearchInput value={searchTerm} onChange={onSearchChange} placeholder="Search endpoints..." />

      {error && (
        <div className="p-1.5 bg-(--accent-red)/10 border border-(--accent-red) rounded text-[11px] text-(--accent-red)">
          {error}
        </div>
      )}

      {urlValidationError && (
        <div className="p-1.5 bg-(--accent-yellow)/10 border border-(--accent-yellow) rounded text-[11px] text-(--accent-yellow)">
          {urlValidationError}
        </div>
      )}
    </div>
  )
}
