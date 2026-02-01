import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Webhook, Loader2 } from 'lucide-react'
import { useEndpoints } from '@/hooks'
import { useSelectedEndpoint } from '@/contexts/EndpointContext'
import { EmptyState, Button } from '@/components/ui'
import { LoadingSpinner } from '@/components/ui/Loading'
import { EndpointItem, EndpointConfig } from '@/components/endpoint'
import { useToast } from '@/hooks/useToast'
import { api } from '@/lib/api'
import type { Endpoint, EndpointConfig as Config } from '@/lib/types'
import type { SidebarHandle } from '@/App'

/**
 * Sidebar component for displaying endpoint list
 * Width: 280px, always visible
 */
export const Sidebar = forwardRef<SidebarHandle>((_, ref) => {
  const { endpoints, loading, error, deleteEndpoint, createEndpoint, updateConfig, claimEndpoint } = useEndpoints()
  const { selectedEndpointId, setSelectedEndpointId } = useSelectedEndpoint()
  const [configuringEndpoint, setConfiguringEndpoint] = useState<Endpoint | null>(null)
  const [creating, setCreating] = useState(false)
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({})
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  // Fetch request counts for all endpoints (debounced to avoid loading before selection)
  useEffect(() => {
    // Skip if no endpoints or still loading
    if (endpoints.length === 0 || loading) {
      return
    }

    // Debounce to let auto-selection complete first
    const timer = setTimeout(async () => {
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
    }, 300) // Small delay to let selection happen first

    return () => clearTimeout(timer)
  }, [endpoints, loading])

  // Parse URL on mount to auto-claim and select endpoint from /endpoint/{uuid}
  useEffect(() => {
    const path = window.location.pathname
    const endpointMatch = path.match(/^\/endpoint\/([0-9a-f-]+)$/i)

    if (endpointMatch) {
      const endpointId = endpointMatch[1]

      // Verify endpoint exists before claiming
      api.endpoints
        .get(endpointId)
        .then((endpoint) => {
          claimEndpoint(endpoint.id)
          setSelectedEndpointId(endpoint.id)
          setUrlValidationError(null)
        })
        .catch(() => {
          setUrlValidationError(`Endpoint not found: ${endpointId}`)
          window.history.pushState(null, '', '/')
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Sync URL with selected endpoint
  useEffect(() => {
    if (selectedEndpointId) {
      const targetUrl = `/endpoint/${selectedEndpointId}`
      if (window.location.pathname !== targetUrl) {
        window.history.pushState(null, '', targetUrl)
      }
    } else {
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/')
      }
    }
  }, [selectedEndpointId])

  async function handleCreateEndpoint() {
    setCreating(true)
    try {
      const newEndpoint = await createEndpoint()
      if (newEndpoint) {
        setSelectedEndpointId(newEndpoint.id) // Auto-select the newly created endpoint
        success('Endpoint created successfully')
      }
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

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    createEndpoint: handleCreateEndpoint,
  }))

  return (
    <aside className="w-[280px] bg-(--surface) border-r border-(--border) overflow-y-auto flex flex-col">
      <div className="p-2 border-b border-(--border)">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleCreateEndpoint} disabled={creating}>
              {creating ? <LoadingSpinner size="sm" /> : 'New'}
            </Button>
            <span className="text-xs font-medium text-(--text-tertiary)">
              {endpoints.length} {endpoints.length === 1 ? 'endpoint' : 'endpoints'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-2 p-1.5 bg-(--accent-red)/10 border border-(--accent-red) rounded text-[11px] text-(--accent-red)">
            {error}
          </div>
        )}

        {urlValidationError && (
          <div className="mt-2 p-1.5 bg-(--accent-yellow)/10 border border-(--accent-yellow) rounded text-[11px] text-(--accent-yellow)">
            {urlValidationError}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-(--text-tertiary)" />
          </div>
        ) : endpoints.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Webhook className="w-12 h-12" />}
              title="No endpoints yet"
              description="Create a new endpoint or visit an endpoint URL to get started."
              action={
                <Button variant="primary" onClick={handleCreateEndpoint}>
                  Create Endpoint
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {endpoints
              .filter((endpoint) => endpoint && endpoint.id)
              .map((endpoint) => (
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
})

Sidebar.displayName = 'Sidebar'
