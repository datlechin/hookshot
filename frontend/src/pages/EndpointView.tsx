import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle2, WifiOff, Wifi } from 'lucide-react';
import { useEndpoint } from '@/hooks/useEndpoints';
import { useRequests } from '@/hooks/useRequests';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RequestList } from '@/components/RequestList';
import type { Request } from '@/types';

const REQUESTS_PER_PAGE = 50;

export default function EndpointView() {
  const { id } = useParams<{ id: string }>();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [displayCount, setDisplayCount] = useState(REQUESTS_PER_PAGE);

  const { data: endpoint, isLoading: isLoadingEndpoint } = useEndpoint(id);
  const { data: requests, isLoading: isLoadingRequests } = useRequests(id);
  const { isConnected, newRequests, clearNewRequests } = useWebSocket(id);

  const webhookUrl = `${window.location.origin}/hook/${id}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  };

  // Merge live and fetched requests, removing duplicates
  const allRequests = useMemo(() => {
    const requestMap = new Map<string, Request>();

    // Add fetched requests first
    requests?.forEach((req) => requestMap.set(req.id, req));

    // Add new requests (will override if same ID)
    newRequests.forEach((req) => requestMap.set(req.id, req));

    // Sort by received_at descending
    return Array.from(requestMap.values()).sort(
      (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );
  }, [requests, newRequests]);

  const displayedRequests = allRequests.slice(0, displayCount);
  const hasMore = allRequests.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + REQUESTS_PER_PAGE);
    clearNewRequests();
  };

  if (isLoadingEndpoint || isLoadingRequests) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">Endpoint not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {copiedUrl && (
        <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 z-50">
          <CheckCircle2 className="h-4 w-4" />
          URL copied to clipboard!
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{endpoint.name}</h1>
            <Badge variant={isConnected ? 'default' : 'secondary'} className="flex items-center gap-1">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
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
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-muted rounded-md text-sm break-all">
              {webhookUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyUrl}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Send HTTP requests to this URL. All methods (GET, POST, PUT, DELETE, etc.) are supported.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Requests</CardTitle>
              <CardDescription>
                {allRequests.length} request{allRequests.length !== 1 ? 's' : ''} received
                {newRequests.length > 0 && (
                  <span className="ml-2 text-primary font-medium">
                    ({newRequests.length} new)
                  </span>
                )}
              </CardDescription>
            </div>
            {allRequests.length > 0 && (
              <Badge variant="outline">
                Showing {displayedRequests.length} of {allRequests.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <RequestList
            requests={displayedRequests}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoading={false}
            newRequestCount={newRequests.length}
          />
        </CardContent>
      </Card>
    </div>
  );
}
