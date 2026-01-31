/**
 * Copy URL button component
 * Copies webhook URL to clipboard with visual feedback
 */

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyURLButtonProps {
  endpointId: string
  className?: string
}

export function CopyURLButton({ endpointId, className = '' }: CopyURLButtonProps) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/webhook/${endpointId}`

  async function copyToClipboard(e: React.MouseEvent) {
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  return (
    <button
      onClick={copyToClipboard}
      className={`flex items-center gap-2 text-sm text-(--text-secondary) hover:text-(--text-primary) transition-colors ${className}`}
      title={copied ? 'Copied!' : 'Copy webhook URL'}
      aria-label={copied ? 'Copied webhook URL' : 'Copy webhook URL'}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-(--accent-green)" />
          <span className="text-(--accent-green)">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copy URL</span>
        </>
      )}
    </button>
  )
}
