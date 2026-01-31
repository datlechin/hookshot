import { useState, lazy, Suspense } from 'react'
import { useTheme } from '@/hooks'
import { EndpointProvider, useSelectedEndpoint } from '@/contexts/EndpointContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/toaster'
import type { Request } from '@/lib/types'

// Lazy load layout components for better code splitting
const Header = lazy(() => import('@/components/layout/Header').then(module => ({ default: module.Header })))
const Sidebar = lazy(() => import('@/components/layout/Sidebar').then(module => ({ default: module.Sidebar })))
const RequestList = lazy(() => import('@/components/layout/RequestList').then(module => ({ default: module.RequestList })))
const DetailPanel = lazy(() => import('@/components/layout/DetailPanel').then(module => ({ default: module.DetailPanel })))

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  )
}

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
    <Suspense fallback={<LoadingFallback />}>
      <div className={theme}>
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
          <Header theme={theme} onToggleTheme={toggleTheme} connectionStatus={connectionStatus} />

          {/* Main 3-panel layout - offset by header height (64px) */}
          <div className="flex h-[calc(100vh-64px)] pt-16">
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
          <Toaster />
        </div>
      </div>
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <EndpointProvider>
        <AppContent />
      </EndpointProvider>
    </ErrorBoundary>
  )
}
