import { useState, useEffect } from 'react'
import { Webhook, Loader2 } from 'lucide-react'
import { useEndpoints } from '@/hooks'
import { useSelectedEndpoint } from '@/contexts/EndpointContext'
import { EmptyState, Button } from '@/components/ui'
import { LoadingSpinner } from '@/components/ui/Loading'
import { EndpointItem, EndpointConfig } from '@/components/endpoint'
import { useToast } from '@/hooks/useToast'
import { api } from '@/lib/api'
import type { Endpoint, EndpointConfig as Config } from '@/lib/types'

/**
 * Sidebar component for displaying endpoint list
 * Width: 280px on desktop, collapsible on tablet, hidden on mobile
 */
export function Sidebar() {
  const {
    endpoints,
    loading,
    error,
    deleteEndpoint,
    createEndpoint,
    updateConfig,
  } = useEndpoints()
  const { selectedEndpointId, setSelectedEndpointId } = useSelectedEndpoint()
  const [configuringEndpoint, setConfiguringEndpoint] = useState<Endpoint | null>(null)
  const [creating, setCreating] = useState(false)
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({})
  const { success, error: showError } = useToast()

  // Fetch request counts for all endpoints
  useEffect(() => {
    async function fetchRequestCounts() {
      const counts: Record<string, number> = {}
      for (const endpoint of endpoints) {
        try {
          const requests = await api.requests.list(endpoint.id)
          counts[endpoint.id] = requests.length
        } catch (err) {
          console.error(`Failed to fetch request count for ${endpoint.id}:`, err)
          counts[endpoint.id] = 0
        }
      }
      setRequestCounts(counts)
    }

    if (endpoints.length > 0) {
      fetchRequestCounts()
    }
  }, [endpoints])

  async function handleCreateEndpoint() {
    setCreating(true)
    try {
      await createEndpoint()
      success('Endpoint created successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create endpoint'
      showError(message)
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteEndpoint(id: string) {
    try {
      await deleteEndpoint(id)
      success('Endpoint deleted successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete endpoint'
      showError(message)
    }
  }

  async function handleSaveConfig(config: Config) {
    if (!configuringEndpoint) return
    try {
      await updateConfig(configuringEndpoint.id, config)
      setConfiguringEndpoint(null)
      success('Configuration saved successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save configuration'
      showError(message)
    }
  }

  return (
    <aside className="hidden lg:block w-[280px] bg-[var(--surface)] border-r border-[var(--border)] overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Endpoints
          </h2>
          <Button variant="primary" size="sm" onClick={handleCreateEndpoint} disabled={creating}>
            {creating ? <LoadingSpinner size="sm" /> : 'New'}
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-[var(--accent-red)]/10 border border-[var(--accent-red)] rounded text-xs text-[var(--accent-red)]">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--text-tertiary)]" />
          </div>
        ) : endpoints.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Webhook className="w-12 h-12" />}
              title="No endpoints yet"
              description="Create your first webhook endpoint to get started."
              action={
                <Button variant="primary" onClick={handleCreateEndpoint}>
                  Create Endpoint
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {endpoints.map((endpoint) => (
              <EndpointItem
                key={endpoint.id}
                endpoint={endpoint}
                selected={selectedEndpointId === endpoint.id}
                onSelect={() => setSelectedEndpointId(endpoint.id)}
                onDelete={() => handleDeleteEndpoint(endpoint.id)}
                onConfigure={() => setConfiguringEndpoint(endpoint)}
                requestCount={requestCounts[endpoint.id] || 0}
              />
            ))}
          </div>
        )}

        {/* Config Dialog */}
        {configuringEndpoint && (
          <EndpointConfig
            endpoint={configuringEndpoint}
            onSave={handleSaveConfig}
            onCancel={() => setConfiguringEndpoint(null)}
          />
        )}
      </div>
    </aside>
  )
}
