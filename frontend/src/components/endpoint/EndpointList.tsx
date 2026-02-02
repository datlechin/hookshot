import { Webhook } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { EmptyState, Button, Skeleton } from '@/components/ui'
import { EndpointItem } from '@/components/endpoint'
import type { Endpoint } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * List container variant definitions
 */
const listContainerVariants = cva('p-2', {
  variants: {
    density: {
      compact: 'space-y-0.5',
      comfortable: 'space-y-1',
      spacious: 'space-y-2',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/**
 * EndpointListSkeleton - Loading state component
 */
function EndpointListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className={cn(listContainerVariants({ density: 'comfortable' }))}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-2 rounded border-l-3 border-transparent">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-1.5">
                <Skeleton variant="text" className="w-20 h-4" />
                <Skeleton variant="rect" className="w-8 h-4" />
              </div>
              <Skeleton variant="line" className="w-48 h-3" />
              <Skeleton variant="line" className="w-32 h-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * EndpointList props
 */
interface EndpointListProps extends VariantProps<typeof listContainerVariants> {
  endpoints: Endpoint[]
  loading: boolean
  selectedEndpointId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onConfigure: (endpoint: Endpoint) => void
  onCreateEndpoint: () => void
  customNames: Record<string, string>
  onSetCustomName: (endpointId: string, name: string) => void
  lastRequestTimes: Record<string, string | null>
  hasSearchResults: boolean
}

export function EndpointList({
  endpoints,
  loading,
  selectedEndpointId,
  onSelect,
  onDelete,
  onConfigure,
  onCreateEndpoint,
  customNames,
  onSetCustomName,
  lastRequestTimes,
  hasSearchResults,
  density = 'comfortable',
}: EndpointListProps) {
  // Loading state
  if (loading) {
    return <EndpointListSkeleton count={5} />
  }

  // Empty state - no results for search
  if (endpoints.length === 0 && hasSearchResults) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<Webhook className="w-12 h-12" />}
          title="No matching endpoints"
          description="Try adjusting your search term or filters."
        />
      </div>
    )
  }

  // Empty state - no endpoints at all
  if (endpoints.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<Webhook className="w-12 h-12" />}
          title="No endpoints yet"
          description="Create a new endpoint or visit an endpoint URL to get started."
          action={
            <Button variant="primary" onClick={onCreateEndpoint}>
              Create Endpoint
            </Button>
          }
        />
      </div>
    )
  }

  // Endpoint list
  return (
    <div className={cn(listContainerVariants({ density }))} role="list" aria-label="Endpoint list">
      {endpoints
        .filter((endpoint) => endpoint && endpoint.id)
        .map((endpoint) => (
          <EndpointItem
            key={endpoint.id}
            endpoint={endpoint}
            selected={selectedEndpointId === endpoint.id}
            onSelect={() => onSelect(endpoint.id)}
            onDelete={() => onDelete(endpoint.id)}
            onConfigure={() => onConfigure(endpoint)}
            customName={customNames[endpoint.id]}
            onSetCustomName={(name) => onSetCustomName(endpoint.id, name)}
            lastRequestTime={lastRequestTimes[endpoint.id] || null}
            compact={density === 'compact'}
          />
        ))}
    </div>
  )
}

// Export skeleton for potential external use
EndpointList.Skeleton = EndpointListSkeleton
