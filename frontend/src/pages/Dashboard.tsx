import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { endpointsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Dashboard() {
  const { data: endpoints, isLoading, error } = useQuery({
    queryKey: ['endpoints'],
    queryFn: endpointsApi.list,
  });

  if (isLoading) {
    return <div>Loading endpoints...</div>;
  }

  if (error) {
    return <div className="text-destructive">Failed to load endpoints: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your webhook endpoints</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Endpoint
        </Button>
      </div>

      {endpoints && endpoints.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No endpoints yet</CardTitle>
            <CardDescription>
              Create your first webhook endpoint to get started
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {endpoints?.map((endpoint) => (
            <Link key={endpoint.id} to={`/endpoints/${endpoint.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{endpoint.name}</CardTitle>
                  {endpoint.description && (
                    <CardDescription>{endpoint.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(endpoint.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
