import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useEndpoints } from '@/hooks'
import { useSelectedEndpoint } from '@/contexts/EndpointContext'
import { EndpointConfig } from '@/components/endpoint'
import { SidebarHeader } from '@/components/layout/SidebarHeader'
import { EndpointList } from '@/components/endpoint/EndpointList'
import { useToast } from '@/hooks/useToast'
import { useEndpointNames } from '@/hooks/useEndpointNames'
import { useSidebarFilters } from '@/hooks/useSidebarFilters'
import { useLastRequestTime } from '@/hooks/useLastRequestTime'
import { api } from '@/lib/api'
import type { Endpoint, EndpointConfig as Config } from '@/lib/types'
import type { SidebarHandle } from '@/App'

/**
 * Sidebar component for displaying endpoint list
 * Width: 280px, collapsible
 */
export const Sidebar = forwardRef<SidebarHandle>((_, ref) => {
  const { endpoints, loading, error, deleteEndpoint, createEndpoint, updateConfig, claimEndpoint } =
    useEndpoints()
  const { selectedEndpointId, setSelectedEndpointId } = useSelectedEndpoint()
  const [configuringEndpoint, setConfiguringEndpoint] = useState<Endpoint | null>(null)
  const [creating, setCreating] = useState(false)
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  // Custom names hook
  const { customNames, setCustomName, removeCustomName } = useEndpointNames()

  // Filter and sort hook
  const { searchTerm, setSearchTerm, sortBy, setSortBy, filteredAndSortedEndpoints } =
    useSidebarFilters(endpoints, { customNames })

  // Last request times
  const endpointIds = endpoints.map((e) => e.id)
  const lastRequestTimes = useLastRequestTime(endpointIds)

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
      // Clean up custom name when endpoint is deleted
      removeCustomName(id)
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
    <aside className="w-70 bg-(--surface) border-r border-(--border) overflow-y-auto flex flex-col h-full">
      <SidebarHeader
        endpointCount={endpoints.length}
        onCreateEndpoint={handleCreateEndpoint}
        creating={creating}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        error={error}
        urlValidationError={urlValidationError}
      />

      <div className="flex-1 overflow-y-auto">
        <EndpointList
          endpoints={filteredAndSortedEndpoints}
          loading={loading}
          selectedEndpointId={selectedEndpointId}
          onSelect={setSelectedEndpointId}
          onDelete={handleDeleteEndpoint}
          onConfigure={setConfiguringEndpoint}
          onCreateEndpoint={handleCreateEndpoint}
          customNames={customNames}
          onSetCustomName={setCustomName}
          lastRequestTimes={lastRequestTimes}
          hasSearchResults={searchTerm.trim().length > 0}
        />

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
