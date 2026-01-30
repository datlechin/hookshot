import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Trash2 } from 'lucide-react';
import type { Endpoint } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeleteEndpoint } from '@/hooks/useEndpoints';
import { useState } from 'react';

interface EndpointListProps {
  endpoints: Endpoint[];
  onCopyUrl: (endpointId: string) => void;
}

export function EndpointList({ endpoints, onCopyUrl }: EndpointListProps) {
  const deleteEndpoint = useDeleteEndpoint();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this endpoint?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteEndpoint.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete endpoint:', error);
      alert('Failed to delete endpoint');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onCopyUrl(id);
  };

  if (endpoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No endpoints yet</CardTitle>
          <CardDescription>
            Create your first webhook endpoint to get started
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {endpoints.map((endpoint) => (
        <Link key={endpoint.id} to={`/endpoints/${endpoint.id}`}>
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="truncate">{endpoint.name}</CardTitle>
                  {endpoint.description && (
                    <CardDescription className="line-clamp-2">
                      {endpoint.description}
                    </CardDescription>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {endpoint.id.slice(0, 8)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created {formatDistanceToNow(new Date(endpoint.created_at), { addSuffix: true })}
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => handleCopy(e, endpoint.id)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => handleDelete(e, endpoint.id)}
                disabled={deletingId === endpoint.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
