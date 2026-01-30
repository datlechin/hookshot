import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

interface FilterBarProps {
  selectedMethods: Set<string>;
  searchQuery: string;
  onMethodToggle: (method: string) => void;
  onSearchChange: (query: string) => void;
  onClear: () => void;
  totalRequests: number;
  filteredCount: number;
}

export function FilterBar({
  selectedMethods,
  searchQuery,
  onMethodToggle,
  onSearchChange,
  onClear,
  totalRequests,
  filteredCount,
}: FilterBarProps) {
  const hasFilters = selectedMethods.size > 0 || searchQuery.trim() !== '';
  const showingAll = selectedMethods.size === 0;

  const getMethodVariant = (method: string): 'default' | 'outline' => {
    if (showingAll || selectedMethods.has(method)) {
      return 'default';
    }
    return 'outline';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-2">
          Method:
        </span>
        <Button
          variant={showingAll ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            if (selectedMethods.size > 0) {
              selectedMethods.forEach((method) => onMethodToggle(method));
            }
          }}
          className="h-7"
        >
          ALL
        </Button>
        {HTTP_METHODS.map((method) => (
          <Button
            key={method}
            variant={getMethodVariant(method)}
            size="sm"
            onClick={() => onMethodToggle(method)}
            className="h-7"
          >
            {method}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search in headers and body..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear Filters
          </Button>
        )}
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            Showing {filteredCount} of {totalRequests} requests
          </span>
          {selectedMethods.size > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Filtered by:</span>
              {Array.from(selectedMethods).map((method) => (
                <Badge key={method} variant="secondary" className="text-xs">
                  {method}
                </Badge>
              ))}
            </div>
          )}
          {searchQuery && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                Search: "{searchQuery}"
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
