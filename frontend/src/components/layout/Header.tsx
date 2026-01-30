import { Moon, Sun, Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import type { Theme } from '@/hooks/useTheme'

interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
  onCreateEndpoint?: () => void
  connectionStatus?: 'connected' | 'connecting' | 'disconnected' | 'polling'
}

export function Header({
  theme,
  onToggleTheme,
  onCreateEndpoint,
  connectionStatus = 'disconnected',
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-(--surface) border-b border-(--border) z-50">
      <div className="flex items-center justify-between h-full px-4">
        Ï{' '}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-(--accent-blue) rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <h1 className="text-xl font-bold text-(--text-primary)">Hookshot</h1>
        </div>
        Ï{' '}
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateEndpoint}
            className="sm:hidden"
            aria-label="Create endpoint"
          >
            <Plus className="w-4 h-4" />
          </Button>
          Ï{' '}
          {connectionStatus !== 'disconnected' && (
            <div
              className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full ${
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
                className={`text-xs font-medium ${
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
          Ï{' '}
          <Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
