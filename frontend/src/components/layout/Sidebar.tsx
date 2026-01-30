import { useState } from 'react'
import { Webhook, Loader2 } from 'lucide-react'
import { useEndpoints } from '@/hooks'
import { EmptyState, Button } from '@/components/ui'
import { EndpointItem, EndpointConfig } from '@/components/endpoint'
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
    selectedId,
    setSelectedId,
    deleteEndpoint,
    createEndpoint,
    updateConfig,
  } = useEndpoints()
  const [configuringEndpoint, setConfiguringEndpoint] = useState<Endpoint | null>(null)

  async function handleCreateEndpoint() {
    await createEndpoint()
  }

  async function handleDeleteEndpoint(id: string) {
    await deleteEndpoint(id)
  }

  async function handleSaveConfig(config: Config) {
    if (!configuringEndpoint) return
    await updateConfig(configuringEndpoint.id, config)
    setConfiguringEndpoint(null)
  }

  return (
    <aside className="hidden lg:block w-[280px] bg-[var(--surface)] border-r border-[var(--border)] overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Endpoints
          </h2>
          <Button variant="primary" size="sm" onClick={handleCreateEndpoint}>
            New
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
                selected={selectedId === endpoint.id}
                onSelect={() => setSelectedId(endpoint.id)}
                onDelete={() => handleDeleteEndpoint(endpoint.id)}
                onConfigure={() => setConfiguringEndpoint(endpoint)}
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
