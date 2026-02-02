/**
 * Keyboard shortcut utilities
 */

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
};

/**
 * Check if a keyboard event matches a shortcut definition
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean {
  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
  const ctrlMatches = !!event.ctrlKey === !!shortcut.ctrl;
  const metaMatches = !!event.metaKey === !!shortcut.meta;
  const shiftMatches = !!event.shiftKey === !!shortcut.shift;
  const altMatches = !!event.altKey === !!shortcut.alt;

  return keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches;
}

/**
 * Format a shortcut for display (e.g., "Cmd+B", "Ctrl+Shift+F")
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (shortcut.ctrl) parts.push(isMac ? 'Ctrl' : 'Ctrl');
  if (shortcut.meta) parts.push(isMac ? 'Cmd' : 'Win');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push(isMac ? 'Opt' : 'Alt');

  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}

/**
 * Common keyboard shortcuts used in the app
 */
export const SHORTCUTS = {
  TOGGLE_SIDEBAR: {
    key: 'b',
    meta: true, // Cmd on Mac, Win on Windows
  },
  ESCAPE: {
    key: 'Escape',
  },
  ENTER: {
    key: 'Enter',
  },
} as const;
