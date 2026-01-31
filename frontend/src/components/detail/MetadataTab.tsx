import type { WebhookRequest } from '@/lib/types'
import { formatTimestamp, formatBytes } from '@/lib/export'
import { CopyButton } from '@/components/ui'
import { Hash, Globe, Clock, FileText, Database } from 'lucide-react'

interface MetadataTabProps {
  request: WebhookRequest
}

export function MetadataTab({ request }: MetadataTabProps) {
  const bodySize = request.body ? new Blob([request.body]).size : 0
  const headersSize = new Blob([JSON.stringify(request.headers)]).size
  const totalSize = bodySize + headersSize

  const metadata = [
    {
      icon: Hash,
      label: 'Request ID',
      value: request.id.toString(),
      copyable: true,
      ariaLabel: 'Copy Request ID',
    },
    {
      icon: Database,
      label: 'Endpoint ID',
      value: request.endpoint_id,
      copyable: true,
      ariaLabel: 'Copy Endpoint ID',
    },
    {
      icon: Clock,
      label: 'Received At',
      value: formatTimestamp(request.received_at),
      subtitle: new Date(request.received_at).toISOString(),
      copyable: true,
      copyValue: request.received_at,
      ariaLabel: 'Copy Received At timestamp',
    },
    {
      icon: Globe,
      label: 'IP Address',
      value: request.ip_address,
      copyable: true,
      ariaLabel: 'Copy IP Address',
    },
    {
      icon: FileText,
      label: 'Content Type',
      value: request.content_type || 'Not specified',
      copyable: !!request.content_type,
      ariaLabel: 'Copy Content Type',
    },
    {
      icon: FileText,
      label: 'Total Size',
      value: formatBytes(totalSize),
      subtitle: `Headers: ${formatBytes(headersSize)}, Body: ${formatBytes(bodySize)}`,
      copyable: false,
    },
  ]

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-(--text-secondary) mb-3">Request Metadata</h3>
        <div className="space-y-3">
          {metadata.map((item, index) => (
            <MetadataRow key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Full Request Path */}
      <div className="pt-4 border-t border-(--border)">
        <h3 className="text-sm font-semibold text-(--text-secondary) mb-2">Full Request URL</h3>
        <div className="bg-(--background) border border-(--border) rounded p-3">
          <div className="flex items-start justify-between gap-2">
            <code className="text-xs font-mono text-(--text-primary) break-all flex-1">
              {window.location.origin}
              {request.path}
              {request.query_string ? `?${request.query_string}` : ''}
            </code>
            <CopyButton
              text={`${window.location.origin}${request.path}${
                request.query_string ? `?${request.query_string}` : ''
              }`}
              label=""
              aria-label="Copy full request URL"
              className="shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Request Details Summary */}
      <div className="pt-4 border-t border-(--border)">
        <h3 className="text-sm font-semibold text-(--text-secondary) mb-2">Summary</h3>
        <div className="bg-(--background) border border-(--border) rounded p-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-(--text-secondary)">HTTP Method</span>
            <span className="font-mono text-(--text-primary)">{request.method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-(--text-secondary)">Headers Count</span>
            <span className="font-mono text-(--text-primary)">
              {Object.keys(request.headers).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-(--text-secondary)">Has Query String</span>
            <span className="font-mono text-(--text-primary)">
              {request.query_string ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-(--text-secondary)">Has Body</span>
            <span className="font-mono text-(--text-primary)">{request.body ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetadataRowProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  subtitle?: string
  copyable: boolean
  copyValue?: string
  ariaLabel?: string
}

function MetadataRow({
  icon: Icon,
  label,
  value,
  subtitle,
  copyable,
  copyValue,
  ariaLabel,
}: MetadataRowProps) {
  return (
    <div className="bg-(--background) border border-(--border) rounded p-3">
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-(--text-secondary) mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-(--text-secondary) mb-1">{label}</div>
          <div className="text-sm font-mono text-(--text-primary) break-all">{value}</div>
          {subtitle && <div className="text-xs text-(--text-secondary) mt-1">{subtitle}</div>}
        </div>
        {copyable && (
          <CopyButton
            text={copyValue || value}
            label=""
            aria-label={ariaLabel}
            className="shrink-0"
          />
        )}
      </div>
    </div>
  )
}
