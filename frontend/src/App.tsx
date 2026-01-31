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
const Sidebar = lazy(() => import('@/components/layout/Sidebar').then(module => ({ default: module.Sidebar })))
const RequestList = lazy(() => import('@/components/layout/RequestList').then(module => ({ default: module.RequestList })))
const DetailPanel = lazy(() => import('@/components/layout/DetailPanel').then(module => ({ default: module.DetailPanel })))

function AppContent() {
  const { theme } = useTheme()
  const { selectedEndpointId } = useSelectedEndpoint()
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  const handleCloseDetailPanel = () => {
    setSelectedRequest(null)
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

  const handleRequestSelect = (request: Request) => {
    setSelectedRequest(request)
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className={theme}>
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
          {/* Main 3-panel layout - full viewport height */}
          <div className="flex h-screen">
            <Sidebar />
            <RequestList
              selectedEndpointId={selectedEndpointId}
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
