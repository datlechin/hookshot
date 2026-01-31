/**
 * Modal displaying available keyboard shortcuts
 */

import { X, Keyboard } from 'lucide-react'
import { Button } from './Button'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Shortcut {
  key: string
  description: string
  modifiers?: string[]
}

const shortcuts: Shortcut[] = [
  { key: 'N', description: 'Create new endpoint' },
  { key: 'C', description: 'Copy selected request as cURL' },
  { key: 'E', description: 'Export selected request' },
  { key: 'Esc', description: 'Close detail panel' },
  { key: '/', description: 'Focus search' },
  { key: '?', description: 'Show this help', modifiers: ['Shift'] },
]

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-(--surface) border border-(--border) rounded-lg shadow-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-(--border)">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-(--accent-blue)" />
            <h2 className="text-lg font-semibold text-(--text-primary)">Keyboard Shortcuts</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded hover:bg-(--surface-hover) transition-colors"
            >
              <span className="text-sm text-(--text-primary)">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.modifiers?.map((modifier, idx) => (
                  <kbd
                    key={idx}
                    className="px-2 py-1 text-xs font-semibold text-(--text-secondary) bg-(--background) border border-(--border) rounded"
                  >
                    {modifier}
                  </kbd>
                ))}
                <kbd className="px-2 py-1 text-xs font-semibold text-(--text-secondary) bg-(--background) border border-(--border) rounded">
                  {shortcut.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-(--border) bg-(--background)">
          <p className="text-xs text-(--text-secondary)">
            Press{' '}
            <kbd className="px-1 py-0.5 text-xs bg-(--surface) border border-(--border) rounded">
              ?
            </kbd>{' '}
            anytime to view this help
          </p>
        </div>
      </div>
    </div>
  )
}
