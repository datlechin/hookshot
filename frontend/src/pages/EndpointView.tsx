import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { endpointsApi, requestsApi } from '@/lib/api';
import { WebSocketClient } from '@/lib/websocket';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Request } from '@/types';

export default function EndpointView() {
  const { id } = useParams<{ id: string }>();
  const [liveRequests, setLiveRequests] = useState<Request[]>([]);

  const { data: endpoint, isLoading: isLoadingEndpoint } = useQuery({
    queryKey: ['endpoint', id],
    queryFn: () => endpointsApi.get(id!),
    enabled: !!id,
  });

  const { data: requests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['requests', id],
    queryFn: () => requestsApi.list(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;

    const ws = new WebSocketClient(id);
    ws.connect();

    const unsubscribe = ws.onMessage((message) => {
      if (message.type === 'new_request') {
        setLiveRequests((prev) => [message.data, ...prev]);
      }
    });

    return () => {
      unsubscribe();
      ws.disconnect();
    };
  }, [id]);

  if (isLoadingEndpoint || isLoadingRequests) {
    return <div>Loading...</div>;
  }

  if (!endpoint) {
    return <div className="text-destructive">Endpoint not found</div>;
  }

  const allRequests = [...liveRequests, ...(requests || [])];
  const uniqueRequests = Array.from(
    new Map(allRequests.map((r) => [r.id, r])).values()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{endpoint.name}</h1>
          {endpoint.description && (
            <p className="text-muted-foreground">{endpoint.description}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook URL</CardTitle>
          <CardDescription>Send requests to this endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block p-3 bg-muted rounded-md text-sm">
            {window.location.origin}/hook/{id}
          </code>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>
            {uniqueRequests.length} request{uniqueRequests.length !== 1 ? 's' : ''} received
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uniqueRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No requests yet. Send a request to the webhook URL above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Headers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Badge variant="outline">{request.method}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.received_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {Object.keys(request.headers).length} headers
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
