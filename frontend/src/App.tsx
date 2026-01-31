import { useState, lazy, Suspense } from 'react'
import { useTheme } from '@/hooks'
import { useKeyboard } from '@/hooks/useKeyboard'
import { EndpointProvider, useSelectedEndpoint } from '@/contexts/EndpointContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingFallback } from '@/components/ui/Loading'
import { Toaster } from '@/components/ui/toaster'
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal'
import type { Request } from '@/lib/types'

// Lazy load layout components for better code splitting
const Header = lazy(() => import('@/components/layout/Header').then(module => ({ default: module.Header })))
const Sidebar = lazy(() => import('@/components/layout/Sidebar').then(module => ({ default: module.Sidebar })))
const RequestList = lazy(() => import('@/components/layout/RequestList').then(module => ({ default: module.RequestList })))
const DetailPanel = lazy(() => import('@/components/layout/DetailPanel').then(module => ({ default: module.DetailPanel })))

function AppContent() {
  const { theme, toggleTheme } = useTheme()
  const { selectedEndpointId } = useSelectedEndpoint()
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected' | 'polling'
  >('disconnected')
  const handleCloseDetailPanel = () => {
    setSelectedRequest(null)
  }
  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Keyboard shortcuts
  useKeyboard([
    {
      key: 'Escape',
      handler: () => {
        if (showShortcutsModal) {
          setShowShortcutsModal(false)
        } else {
          handleCloseDetailPanel()
        }
      },
      description: 'Close detail panel or modal',
    },
    {
      key: '?',
      shiftKey: true,
      handler: () => setShowShortcutsModal(true),
      description: 'Show keyboard shortcuts',
    },
  ])

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
          <Header
            theme={theme}
            onToggleTheme={toggleTheme}
            connectionStatus={connectionStatus}
            onToggleSidebar={handleToggleSidebar}
          />

          {/* Main 3-panel layout - offset by header height (48px) */}
          <div className="flex h-[calc(100vh-48px)] mt-12">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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
          <KeyboardShortcutsModal
            isOpen={showShortcutsModal}
            onClose={() => setShowShortcutsModal(false)}
          />
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
