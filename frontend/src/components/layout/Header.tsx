import { Menu } from 'lucide-react'
import { Button } from '@/components/ui'

interface HeaderProps {
  onToggleSidebar?: () => void
  connectionStatus?: 'connected' | 'connecting' | 'disconnected' | 'polling'
}

export function Header({
  onToggleSidebar,
  connectionStatus = 'disconnected',
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-[var(--surface)] border-b border-[var(--border)] z-50">
      <div className="flex items-center justify-between h-full px-3">
        <div className="flex items-center space-x-2">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden -ml-1"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          {connectionStatus !== 'disconnected' && (
            <div
              className={`hidden md:flex items-center space-x-1.5 px-2 py-0.5 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-(--accent-green)/10 border border-(--accent-green)/20'
                  : connectionStatus === 'connecting'
                    ? 'bg-(--accent-yellow)/10 border border-(--accent-yellow)/20'
                    : connectionStatus === 'polling'
                      ? 'bg-(--accent-blue)/10 border border-(--accent-blue)/20'
                      : 'bg-(--accent-red)/10 border border-(--accent-red)/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-(--accent-green) animate-pulse'
                    : connectionStatus === 'connecting'
                      ? 'bg-(--accent-yellow) animate-pulse'
                      : connectionStatus === 'polling'
                        ? 'bg-(--accent-blue)'
                        : 'bg-(--accent-red)'
                }`}
              ></span>
              <span
                className={`text-[11px] font-medium ${
                  connectionStatus === 'connected'
                    ? 'text-(--accent-green)'
                    : connectionStatus === 'connecting'
                      ? 'text-(--accent-yellow)'
                      : connectionStatus === 'polling'
                        ? 'text-(--accent-blue)'
                        : 'text-(--accent-red)'
                }`}
              >
                {connectionStatus === 'connected'
                  ? 'Connected'
                  : connectionStatus === 'connecting'
                    ? 'Connecting'
                    : connectionStatus === 'polling'
                      ? 'Polling'
                      : 'Disconnected'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
