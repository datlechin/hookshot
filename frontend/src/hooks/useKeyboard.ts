/**
 * Custom hook for keyboard shortcuts
 */

import { useEffect } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  handler: () => void
  description: string
}

export function useKeyboard(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement

      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = !shortcut.ctrlKey || event.ctrlKey
        const shiftMatch = !shortcut.shiftKey || event.shiftKey
        const metaMatch = !shortcut.metaKey || event.metaKey
        const altMatch = !shortcut.altKey || event.altKey

        // Ensure modifiers are only pressed when required
        const noExtraCtrl = shortcut.ctrlKey || !event.ctrlKey
        const noExtraShift = shortcut.shiftKey || !event.shiftKey
        const noExtraMeta = shortcut.metaKey || !event.metaKey
        const noExtraAlt = shortcut.altKey || !event.altKey

        if (
          keyMatch &&
          ctrlMatch &&
          shiftMatch &&
          metaMatch &&
          altMatch &&
          noExtraCtrl &&
          noExtraShift &&
          noExtraMeta &&
          noExtraAlt
        ) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'n',
    description: 'Create new endpoint',
    handler: () => {}, // Will be overridden
  },
  {
    key: 'c',
    description: 'Copy selected request as cURL',
    handler: () => {}, // Will be overridden
  },
  {
    key: 'e',
    description: 'Export selected request',
    handler: () => {}, // Will be overridden
  },
  {
    key: 'Escape',
    description: 'Close detail panel',
    handler: () => {}, // Will be overridden
  },
  {
    key: '/',
    description: 'Focus search',
    handler: () => {}, // Will be overridden
  },
  {
    key: '?',
    shiftKey: true,
    description: 'Show keyboard shortcuts',
    handler: () => {}, // Will be overridden
  },
]
