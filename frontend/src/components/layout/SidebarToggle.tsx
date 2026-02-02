import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { useEffect } from 'react';
import { SHORTCUTS, matchesShortcut, formatShortcut } from '@/utils/keyboard';

interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ collapsed, onToggle }: SidebarToggleProps) {
  // Keyboard shortcut (Cmd+B / Ctrl+B)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (matchesShortcut(event, SHORTCUTS.TOGGLE_SIDEBAR)) {
        event.preventDefault();
        onToggle();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  const shortcutLabel = formatShortcut(SHORTCUTS.TOGGLE_SIDEBAR);

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-2 h-8 bg-(--background) border border-(--border) rounded text-xs text-(--text-secondary) hover:text-(--text-primary) hover:border-(--border-hover) transition-colors"
      aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
      title={`Toggle sidebar (${shortcutLabel})`}
    >
      {collapsed ? (
        <PanelLeft className="w-4 h-4" />
      ) : (
        <PanelLeftClose className="w-4 h-4" />
      )}
    </button>
  );
}
