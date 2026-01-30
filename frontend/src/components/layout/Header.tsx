import { Moon, Sun, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Theme } from '@/hooks/useTheme';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onCreateEndpoint?: () => void;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected' | 'polling';
}

/**
 * Fixed header component with logo, actions, and theme toggle
 * Height: 64px, sticky at top
 */
export function Header({ theme, onToggleTheme, onCreateEndpoint, connectionStatus = 'disconnected' }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--surface)] border-b border-[var(--border)] z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Logo/Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[var(--accent-blue)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Hookshot</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Create Endpoint Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateEndpoint}
            className="hidden sm:flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Endpoint</span>
          </Button>

          {/* Mobile Create Button (icon only) */}
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateEndpoint}
            className="sm:hidden"
            aria-label="Create endpoint"
          >
            <Plus className="w-4 h-4" />
          </Button>

          {/* Connection Status Indicator */}
          {connectionStatus !== 'disconnected' && (
            <div
              className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20'
                  : connectionStatus === 'connecting'
                    ? 'bg-[var(--accent-yellow)]/10 border border-[var(--accent-yellow)]/20'
                    : connectionStatus === 'polling'
                      ? 'bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20'
                      : 'bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-[var(--accent-green)] animate-pulse'
                    : connectionStatus === 'connecting'
                      ? 'bg-[var(--accent-yellow)] animate-pulse'
                      : connectionStatus === 'polling'
                        ? 'bg-[var(--accent-blue)]'
                        : 'bg-[var(--accent-red)]'
                }`}
              ></span>
              <span
                className={`text-xs font-medium ${
                  connectionStatus === 'connected'
                    ? 'text-[var(--accent-green)]'
                    : connectionStatus === 'connecting'
                      ? 'text-[var(--accent-yellow)]'
                      : connectionStatus === 'polling'
                        ? 'text-[var(--accent-blue)]'
                        : 'text-[var(--accent-red)]'
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

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
