import { useState, lazy, Suspense, useRef, useCallback } from 'react'
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

export interface SidebarHandle {
  createEndpoint: () => void
}

export interface RequestListHandle {
  focusSearch: () => void
}

export interface DetailPanelHandle {
  copyAsCurl: () => void
  exportRequest: () => void
}

function AppContent() {
  const { selectedEndpointId } = useSelectedEndpoint()
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Refs to access child component functions
  const sidebarRef = useRef<SidebarHandle>(null)
  const requestListRef = useRef<RequestListHandle>(null)
  const detailPanelRef = useRef<DetailPanelHandle>(null)

  const handleCloseDetailPanel = useCallback(() => {
    setSelectedRequest(null)
  }, [])

  // Keyboard shortcuts
  useKeyboard([
    {
      key: 'n',
      handler: () => {
        sidebarRef.current?.createEndpoint()
      },
      description: 'Create new endpoint',
    },
    {
      key: '/',
      handler: () => {
        requestListRef.current?.focusSearch()
      },
      description: 'Focus search',
    },
    {
      key: 'c',
      handler: () => {
        if (selectedRequest) {
          detailPanelRef.current?.copyAsCurl()
        }
      },
      description: 'Copy selected request as cURL',
    },
    {
      key: 'e',
      handler: () => {
        if (selectedRequest) {
          detailPanelRef.current?.exportRequest()
        }
      },
      description: 'Export selected request',
    },
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
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        {/* Main 3-panel layout - full viewport height */}
        <div className="flex h-screen">
          <Sidebar ref={sidebarRef} />
          <RequestList
            ref={requestListRef}
            selectedEndpointId={selectedEndpointId}
            onRequestSelect={handleRequestSelect}
          />
          <DetailPanel
            ref={detailPanelRef}
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
