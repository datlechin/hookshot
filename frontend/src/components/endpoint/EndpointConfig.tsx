/**
 * EndpointConfig component
 * Modal dialog for configuring endpoint custom responses
 */

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button, Input, Textarea, Select, Checkbox } from '@/components/ui'
import { validateStatusCode, validateJSON, validateHeaderName } from '@/lib/validation'
import { animations } from '@/lib/transitions'
import type { Endpoint, EndpointConfig as Config } from '@/lib/types'

interface EndpointConfigProps {
  endpoint: Endpoint
  onSave: (config: Config) => Promise<void>
  onCancel: () => void
}

// Common HTTP status codes with descriptions
const STATUS_CODES = [
  { value: 200, label: '200 OK' },
  { value: 201, label: '201 Created' },
  { value: 202, label: '202 Accepted' },
  { value: 204, label: '204 No Content' },
  { value: 400, label: '400 Bad Request' },
  { value: 401, label: '401 Unauthorized' },
  { value: 403, label: '403 Forbidden' },
  { value: 404, label: '404 Not Found' },
  { value: 422, label: '422 Unprocessable Entity' },
  { value: 500, label: '500 Internal Server Error' },
  { value: 502, label: '502 Bad Gateway' },
  { value: 503, label: '503 Service Unavailable' },
]

// Common headers suggestions
const COMMON_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-API-Key',
  'X-Request-ID',
  'Cache-Control',
  'Access-Control-Allow-Origin',
]

interface Header {
  key: string
  value: string
}

export function EndpointConfig({ endpoint, onSave, onCancel }: EndpointConfigProps) {
  const [enabled, setEnabled] = useState(endpoint.custom_response_enabled)
  const [statusCode, setStatusCode] = useState(endpoint.response_status?.toString() || '200')
  const [customStatus, setCustomStatus] = useState(false)
  const [headers, setHeaders] = useState<Header[]>(() => {
    if (endpoint.response_headers && Object.keys(endpoint.response_headers).length > 0) {
      return Object.entries(endpoint.response_headers).map(([key, value]) => ({ key, value }))
    }
    return []
  })
  const [body, setBody] = useState(endpoint.response_body || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [headerErrors, setHeaderErrors] = useState<Record<number, { key?: string; value?: string }>>({})

  // Check if custom status code is being used
  useEffect(() => {
    const isCommon = STATUS_CODES.some((sc) => sc.value.toString() === statusCode)
    setCustomStatus(!isCommon)
  }, [statusCode])

  // Validate JSON if Content-Type is application/json
  useEffect(() => {
    const contentType = headers.find((h) => h.key.toLowerCase() === 'content-type')?.value
    if (contentType?.toLowerCase().includes('application/json') && body.trim()) {
      const error = validateJSON(body)
      setJsonError(error)
    } else {
      setJsonError(null)
    }
  }, [body, headers])

  // Validate headers on change
  useEffect(() => {
    const errors: Record<number, { key?: string; value?: string }> = {}
    headers.forEach((header, index) => {
      if (header.key.trim()) {
        const keyError = validateHeaderName(header.key)
        if (keyError) {
          errors[index] = { ...errors[index], key: keyError }
        }
      }
    })
    setHeaderErrors(errors)
  }, [headers])

  function handleAddHeader() {
    setHeaders([...headers, { key: '', value: '' }])
  }

  function handleRemoveHeader(index: number) {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  function handleHeaderChange(index: number, field: 'key' | 'value', value: string) {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  function validateForm(): string | null {
    // Validate status code using validation utility
    const code = parseInt(statusCode)
    if (isNaN(code)) {
      return 'Status code must be a number'
    }
    const statusError = validateStatusCode(code)
    if (statusError) {
      return statusError
    }

    // Check for any header validation errors
    if (Object.keys(headerErrors).length > 0) {
      const firstError = Object.values(headerErrors)[0]
      return firstError.key || firstError.value || 'Invalid header configuration'
    }

    // Check for duplicate header keys
    const headerKeys = headers.map((h) => h.key.toLowerCase()).filter((k) => k)
    const duplicates = headerKeys.filter((key, index) => headerKeys.indexOf(key) !== index)
    if (duplicates.length > 0) {
      return `Duplicate header key: ${duplicates[0]}`
    }

    // Check for empty header keys with values
    const emptyKeys = headers.some((h) => !h.key.trim() && h.value.trim())
    if (emptyKeys) {
      return 'Header key cannot be empty'
    }

    // Check JSON validity if needed
    if (jsonError) {
      return jsonError
    }

    return null
  }

  async function handleSave() {
    setError(null)

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    try {
      // Build headers object, filtering out empty entries
      const headersObj = headers
        .filter((h) => h.key.trim() && h.value.trim())
        .reduce(
          (acc, h) => {
            acc[h.key] = h.value
            return acc
          },
          {} as Record<string, string>
        )

      const config: Config = {
        enabled,
        status: parseInt(statusCode),
        headers: Object.keys(headersObj).length > 0 ? JSON.stringify(headersObj) : undefined,
        body: body.trim() || undefined,
      }

      await onSave(config)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save configuration'
      setError(message)
      setSaving(false)
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${animations.fadeIn}`}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="config-title"
    >
      <div
        className={`bg-[var(--surface)] rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl ${animations.fadeIn}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div>
            <h2 id="config-title" className="text-lg font-semibold text-[var(--text-primary)]">
              Configure Response
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] mt-1 font-mono">{endpoint.id}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Enable Custom Response */}
          <div>
            <Checkbox
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              label="Enable custom response"
              description="Override the default webhook response with custom status, headers, and body"
            />
          </div>

          {enabled && (
            <>
              {/* Status Code */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  Status Code
                </label>
                <div className="flex gap-3">
                  {!customStatus ? (
                    <>
                      <Select
                        value={statusCode}
                        onChange={(e) => setStatusCode(e.target.value)}
                        className="flex-1"
                      >
                        {STATUS_CODES.map((sc) => (
                          <option key={sc.value} value={sc.value}>
                            {sc.label}
                          </option>
                        ))}
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => setCustomStatus(true)}>
                        Custom
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        type="number"
                        min="100"
                        max="599"
                        value={statusCode}
                        onChange={(e) => setStatusCode(e.target.value)}
                        placeholder="Enter status code (100-599)"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStatusCode('200')
                          setCustomStatus(false)
                        }}
                      >
                        Common
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Headers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Response Headers
                  </label>
                  <Button variant="ghost" size="sm" onClick={handleAddHeader}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Header
                  </Button>
                </div>

                {headers.length === 0 ? (
                  <p className="text-sm text-[var(--text-tertiary)] italic">
                    No headers configured
                  </p>
                ) : (
                  <div className="space-y-2">
                    {headers.map((header, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              placeholder="Header name"
                              value={header.key}
                              onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                              className={headerErrors[index]?.key ? 'border-[var(--accent-red)]' : ''}
                              list={`common-headers-${index}`}
                            />
                          </div>
                          <datalist id={`common-headers-${index}`}>
                            {COMMON_HEADERS.map((h) => (
                              <option key={h} value={h} />
                            ))}
                          </datalist>
                          <div className="flex-1">
                            <Input
                              placeholder="Header value"
                              value={header.value}
                              onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveHeader(index)}
                            className="text-[var(--text-tertiary)] hover:text-[var(--accent-red)] transition-colors px-2"
                            aria-label="Remove header"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {headerErrors[index]?.key && (
                          <p className="text-xs text-[var(--accent-red)] ml-1">
                            {headerErrors[index].key}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Response Body */}
              <div>
                <Textarea
                  label="Response Body"
                  placeholder="Enter response body (optional)"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  error={jsonError || undefined}
                  helperText={
                    jsonError
                      ? undefined
                      : 'Tip: Add Content-Type header for JSON validation and syntax highlighting'
                  }
                />
              </div>

              {/* Preview */}
              {body && !jsonError && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Preview
                  </label>
                  <pre className="p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-primary)] overflow-x-auto">
                    {(() => {
                      const contentType = headers.find(
                        (h) => h.key.toLowerCase() === 'content-type'
                      )?.value
                      if (contentType?.toLowerCase().includes('application/json')) {
                        try {
                          return JSON.stringify(JSON.parse(body), null, 2)
                        } catch {
                          return body
                        }
                      }
                      return body
                    })()}
                  </pre>
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-[var(--accent-red)]/10 border border-[var(--accent-red)] rounded-lg text-sm text-[var(--accent-red)]">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t border-[var(--border)]">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
