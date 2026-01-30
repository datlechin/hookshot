import { useState } from 'react'
import { useTheme } from '@/hooks'
import { Header, Sidebar, RequestList, DetailPanel } from '@/components/layout'
import { EndpointProvider, useSelectedEndpoint } from '@/contexts/EndpointContext'
import type { Request } from '@/lib/types'

function AppContent() {
  const { theme, toggleTheme } = useTheme()
  const { selectedEndpointId } = useSelectedEndpoint()
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected' | 'polling'
  >('disconnected')
  const handleCloseDetailPanel = () => {
    setSelectedRequest(null)
  }

  const handleConnectionStatusChange = (
    status: 'connected' | 'connecting' | 'disconnected' | 'polling'
  ) => {
    setConnectionStatus(status)
  }

  const handleRequestSelect = (request: Request) => {
    setSelectedRequest(request)
  }

  return (
    <div className={theme}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <Header theme={theme} onToggleTheme={toggleTheme} connectionStatus={connectionStatus} />

        {/* Main 3-panel layout - offset by header height (64px) */}
        <div className="flex h-[calc(100vh-64px)] mt-16">
          <Sidebar />
          <RequestList
            selectedEndpointId={selectedEndpointId}
            onConnectionStatusChange={handleConnectionStatusChange}
            onRequestSelect={handleRequestSelect}
          />
          <DetailPanel
            isOpen={!!selectedRequest}
            onClose={handleCloseDetailPanel}
            selectedRequest={selectedRequest}
          />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <EndpointProvider>
      <AppContent />
    </EndpointProvider>
  )
}
