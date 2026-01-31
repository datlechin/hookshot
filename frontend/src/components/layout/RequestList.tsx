import { useState, useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Inbox } from 'lucide-react'
import { useRequests, useWebSocket } from '@/hooks'
import type { HttpMethod, Request } from '@/lib/types'
import { RequestFilters } from '@/components/request/RequestFilters'
import { RequestSearch, type RequestSearchHandle } from '@/components/request/RequestSearch'
import { VirtualRequestList } from '@/components/request/VirtualRequestList'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequestListSkeleton } from '@/components/ui/Skeleton'
import type { RequestListHandle } from '@/App'

interface RequestListProps {
  selectedEndpointId: string | null
  onConnectionStatusChange?: (
    status: 'connected' | 'connecting' | 'disconnected' | 'polling'
  ) => void
  onRequestSelect?: (request: Request) => void
}

export const RequestList = forwardRef<RequestListHandle, RequestListProps>(({
  selectedEndpointId,
  onConnectionStatusChange,
  onRequestSelect,
}, ref) => {
  const { requests, loading, addRequest } = useRequests(selectedEndpointId)
  const { lastMessage, connected, usingPolling } = useWebSocket(selectedEndpointId)

  const [newRequestIds, setNewRequestIds] = useState<Set<number>>(new Set())
  const timeoutRefs = useRef<Map<number, number>>(new Map())
  const searchRef = useRef<RequestSearchHandle>(null)

  const [selectedMethods, setSelectedMethods] = useState<HttpMethod[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState<number | undefined>()

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'new_request') {
      const newRequest = lastMessage.data as Request

      addRequest(newRequest)

      setNewRequestIds((prev) => new Set(prev).add(newRequest.id))

      const timeoutId = window.setTimeout(() => {
        setNewRequestIds((prev) => {
          const next = new Set(prev)
          next.delete(newRequest.id)
          return next
        })
        timeoutRefs.current.delete(newRequest.id)
      }, 3000)

      timeoutRefs.current.set(newRequest.id, timeoutId)
    }
  }, [lastMessage, addRequest])

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId))
      timeoutRefs.current.clear()
    }
  }, [])

  useEffect(() => {
    if (!selectedEndpointId) {
      onConnectionStatusChange?.('disconnected')
      return
    }

    if (usingPolling) {
      onConnectionStatusChange?.('polling')
    } else if (connected) {
      onConnectionStatusChange?.('connected')
    } else {
      onConnectionStatusChange?.('connecting')
    }
  }, [connected, usingPolling, selectedEndpointId, onConnectionStatusChange])

  const filteredRequests = useMemo(() => {
    if (!Array.isArray(requests)) {
      console.warn('requests is not an array:', requests)
      return []
    }

    return requests.filter((req) => {
      if (selectedMethods.length > 0 && !selectedMethods.includes(req.method as HttpMethod)) {
        return false
      }

      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        const inHeaders = JSON.stringify(req.headers).toLowerCase().includes(search)
        const inBody = req.body?.toLowerCase().includes(search)
        const inPath = req.path?.toLowerCase().includes(search)
        return inHeaders || inBody || inPath
      }

      return true
    })
  }, [requests, selectedMethods, searchQuery])

  function handleRequestClick(request: Request) {
    setSelectedRequestId(request.id)
    onRequestSelect?.(request)
  }

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchRef.current?.focus()
    },
  }))

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-(--background)">
      {/* Header with filters and search */}
      <div className="shrink-0 border-b border-(--border) bg-(--surface) p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-(--text-primary)">
            Requests
            {filteredRequests.length !== requests.length && (
              <span className="ml-2 text-sm font-normal text-(--text-secondary)">
                ({filteredRequests.length} of {requests.length})
              </span>
            )}
          </h2>
          {/* Connection Status */}
          {selectedEndpointId && (
            <div
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full ${
                connected && !usingPolling
                  ? 'bg-(--accent-green)/10 border border-(--accent-green)/20'
                  : usingPolling
                    ? 'bg-(--accent-blue)/10 border border-(--accent-blue)/20'
                    : 'bg-(--accent-yellow)/10 border border-(--accent-yellow)/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connected && !usingPolling
                    ? 'bg-(--accent-green) animate-pulse'
                    : usingPolling
                      ? 'bg-(--accent-blue)'
                      : 'bg-(--accent-yellow) animate-pulse'
                }`}
              ></span>
              <span
                className={`text-[11px] font-medium ${
                  connected && !usingPolling
                    ? 'text-(--accent-green)'
                    : usingPolling
                      ? 'text-(--accent-blue)'
                      : 'text-(--accent-yellow)'
                }`}
              >
                {connected && !usingPolling
                  ? 'Connected'
                  : usingPolling
                    ? 'Polling'
                    : 'Connecting'}
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <RequestFilters selectedMethods={selectedMethods} onMethodsChange={setSelectedMethods} />

        {/* Search bar */}
        <RequestSearch ref={searchRef} value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Scrollable list area */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <RequestListSkeleton />
        ) : !selectedEndpointId ? (
          <EmptyState
            icon={<Inbox className="w-16 h-16" />}
            title="No endpoint selected"
            description="Select an endpoint from the sidebar to view requests."
          />
        ) : (
          <VirtualRequestList
            requests={filteredRequests}
            onRequestClick={handleRequestClick}
            selectedRequestId={selectedRequestId}
            newRequestIds={newRequestIds}
          />
        )}
      </div>
    </main>
  )
})

RequestList.displayName = 'RequestList'
