import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { CopyButton } from '@/components/ui'
import { formatBody, getLanguageFromContentType, formatBytes } from '@/lib/export'
import { AlertCircle } from 'lucide-react'

interface BodyTabProps {
  body?: string
  contentType?: string
}

export function BodyTab({ body, contentType }: BodyTabProps) {
  const [showContent, setShowContent] = useState(false)

  if (!body) {
    return (
      <div className="p-4 text-center py-12">
        <div className="text-sm text-(--text-secondary)">No body content</div>
      </div>
    )
  }

  const bodySize = new Blob([body]).size
  const isLarge = bodySize > 100000 // 100KB
  const language = getLanguageFromContentType(contentType)
  const formattedBody = formatBody(body, language)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-(--border)">
        <div className="flex items-center gap-3">
          <span className="text-xs text-(--text-secondary)">{formatBytes(bodySize)}</span>
          {contentType && (
            <>
              <span className="text-xs text-(--text-secondary)">•</span>
              <span className="text-xs font-mono text-(--text-secondary)">{contentType}</span>
            </>
          )}
        </div>
        <CopyButton text={body} label="Copy Body" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLarge && !showContent ? (
          <div className="p-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-yellow-500 mb-1">
                    Large Payload Detected
                  </div>
                  <div className="text-sm text-(--text-secondary) mb-3">
                    This request contains {formatBytes(bodySize)} of data. Rendering may be slow.
                  </div>
                  <button
                    onClick={() => setShowContent(true)}
                    className="px-3 py-1.5 text-sm font-medium text-(--text-primary) bg-(--background) border border-(--border) rounded hover:bg-(--surface) transition-colors"
                  >
                    Show Content
                  </button>
                </div>
              </div>
            </div>
            <div className="text-xs text-(--text-secondary) mt-2">
              Tip: Use the Copy button to copy the content and view it in an external editor.
            </div>
          </div>
        ) : (
          <div className="p-4">
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              showLineNumbers
              wrapLines
              customStyle={{
                margin: 0,
                padding: '1rem',
                backgroundColor: 'var(--background)',
                fontSize: '0.875rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border)',
              }}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                color: 'var(--text-secondary)',
                userSelect: 'none',
              }}
            >
              {formattedBody}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  )
}
