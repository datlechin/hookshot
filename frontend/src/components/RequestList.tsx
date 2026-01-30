import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock, ChevronDown, ChevronRight } from 'lucide-react';
import type { Request } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/FilterBar';
import { RequestDetail } from '@/components/RequestDetail';

interface RequestListProps {
  requests: Request[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  newRequestCount?: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getMethodColor(method: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'default';
    case 'POST':
      return 'secondary';
    case 'PUT':
    case 'PATCH':
      return 'outline';
    case 'DELETE':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function RequestList({
  requests,
  onLoadMore,
  hasMore,
  isLoading,
  newRequestCount = 0,
}: RequestListProps) {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedMethods, setSelectedMethods] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleRow = (requestId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRows(newExpanded);
  };

  const handleMethodToggle = (method: string) => {
    const newMethods = new Set(selectedMethods);
    if (newMethods.has(method)) {
      newMethods.delete(method);
    } else {
      newMethods.add(method);
    }
    setSelectedMethods(newMethods);
  };

  const handleClearFilters = () => {
    setSelectedMethods(new Set());
    setSearchQuery('');
  };

  // Filter and search requests
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Filter by method
    if (selectedMethods.size > 0) {
      filtered = filtered.filter((req) =>
        selectedMethods.has(req.method.toUpperCase())
      );
    }

    // Search in headers and body
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((req) => {
        // Search in headers (keys and values)
        const headersMatch = Object.entries(req.headers).some(
          ([key, value]) =>
            key.toLowerCase().includes(query) ||
            value.toLowerCase().includes(query)
        );

        // Search in body
        const bodyMatch = req.body?.toLowerCase().includes(query) || false;

        // Search in query params
        const queryParamsMatch = Object.entries(req.query_params).some(
          ([key, value]) =>
            key.toLowerCase().includes(query) ||
            value.toLowerCase().includes(query)
        );

        return headersMatch || bodyMatch || queryParamsMatch;
      });
    }

    return filtered;
  }, [requests, selectedMethods, searchQuery]);

  const hasFilters = selectedMethods.size > 0 || searchQuery.trim() !== '';
  const showNoResults = hasFilters && filteredRequests.length === 0;

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">
          No requests yet. Send a request to the webhook URL above.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <FilterBar
          selectedMethods={selectedMethods}
          searchQuery={searchQuery}
          onMethodToggle={handleMethodToggle}
          onSearchChange={setSearchQuery}
          onClear={handleClearFilters}
          totalRequests={requests.length}
          filteredCount={filteredRequests.length}
        />

        {newRequestCount > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-md p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium">
              {newRequestCount} new request{newRequestCount !== 1 ? 's' : ''} received
            </span>
            <Badge variant="default" className="animate-pulse">
              New
            </Badge>
          </div>
        )}

        {showNoResults && (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg font-medium mb-2">
              No matching requests
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              Try adjusting your filters or search query
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        )}

        {!showNoResults && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Headers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request, index) => {
                const isExpanded = expandedRows.has(request.id);
                const isNew = index < newRequestCount;
                const bodySize = request.body
                  ? new Blob([request.body]).size
                  : 0;

                return (
                  <>
                    <TableRow
                      key={request.id}
                      className={`cursor-pointer hover:bg-accent ${
                        isNew ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(request.id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getMethodColor(request.method)}>
                          {request.method}
                        </Badge>
                        {isNew && (
                          <Badge variant="default" className="ml-2 animate-pulse">
                            New
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDistanceToNow(new Date(request.received_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatBytes(bodySize)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {Object.keys(request.headers).length}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/50">
                          <div className="p-4 space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Timestamp:</span>{' '}
                                {new Date(request.received_at).toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Request ID:</span>{' '}
                                <code className="text-xs">{request.id}</code>
                              </div>
                            </div>
                            {Object.keys(request.query_params).length > 0 && (
                              <div>
                                <span className="font-medium text-sm">Query Parameters:</span>
                                <div className="mt-1 space-y-1">
                                  {Object.entries(request.query_params).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                      <code className="text-xs bg-background px-1 py-0.5 rounded">
                                        {key}
                                      </code>
                                      {' = '}
                                      <span className="text-muted-foreground">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
        )}

        {hasMore && !showNoResults && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>

      <RequestDetail
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </>
  );
}
