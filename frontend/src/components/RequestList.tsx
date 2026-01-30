import { useState } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const toggleRow = (requestId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRows(newExpanded);
  };

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
              {requests.map((request, index) => {
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

        {hasMore && (
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

      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant={getMethodColor(selectedRequest.method)}>
                  {selectedRequest.method}
                </Badge>
                Request Details
              </DialogTitle>
              <DialogDescription>
                {new Date(selectedRequest.received_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="headers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="headers">
                  Headers ({Object.keys(selectedRequest.headers).length})
                </TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="query">
                  Query ({Object.keys(selectedRequest.query_params).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="headers" className="space-y-2">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  {Object.entries(selectedRequest.headers).length === 0 ? (
                    <p className="text-muted-foreground text-sm">No headers</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(selectedRequest.headers).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <code className="text-sm font-medium">{key}</code>
                          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="body">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  {selectedRequest.body ? (
                    <pre className="text-sm whitespace-pre-wrap break-words">
                      {selectedRequest.body}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground text-sm">No body</p>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="query">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  {Object.entries(selectedRequest.query_params).length === 0 ? (
                    <p className="text-muted-foreground text-sm">No query parameters</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(selectedRequest.query_params).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <code className="text-sm font-medium">{key}</code>
                          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
