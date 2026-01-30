/**
 * OverviewTab component - displays request overview information
 */

import type { WebhookRequest } from '@/lib/types';
import { formatTimestamp, formatBytes, exportAsCurl, exportAsJSON } from '@/lib/export';
import { MethodBadge, CopyButton } from '@/components/ui';
import { Globe, Clock, FileText } from 'lucide-react';

interface OverviewTabProps {
  request: WebhookRequest;
}

export function OverviewTab({ request }: OverviewTabProps) {
  const bodySize = request.body ? new Blob([request.body]).size : 0;
  const headersSize = new Blob([JSON.stringify(request.headers)]).size;
  const totalSize = bodySize + headersSize;

  const bodyPreview = request.body
    ? request.body.substring(0, 200) + (request.body.length > 200 ? '...' : '')
    : 'No body content';

  return (
    <div className="p-4 space-y-6">
      {/* Request Line */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">Request</h3>
        <div className="flex items-center gap-3 mb-2">
          <MethodBadge method={request.method} />
          <code className="text-sm font-mono text-[var(--text-primary)]">{request.path}</code>
        </div>
        {request.query_string && (
          <div className="mt-2">
            <span className="text-xs text-[var(--text-secondary)]">Query String:</span>
            <code className="ml-2 text-xs font-mono text-[var(--text-primary)]">
              {request.query_string}
            </code>
          </div>
        )}
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-start gap-3">
          <Globe className="w-4 h-4 text-[var(--text-secondary)] mt-0.5" />
          <div className="flex-1">
            <div className="text-xs text-[var(--text-secondary)] mb-1">IP Address</div>
            <div className="text-sm font-mono text-[var(--text-primary)]">{request.ip_address}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-[var(--text-secondary)] mt-0.5" />
          <div className="flex-1">
            <div className="text-xs text-[var(--text-secondary)] mb-1">Timestamp</div>
            <div className="text-sm text-[var(--text-primary)]">
              {formatTimestamp(request.received_at)}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-[var(--text-secondary)] mt-0.5" />
          <div className="flex-1">
            <div className="text-xs text-[var(--text-secondary)] mb-1">Content Type</div>
            <div className="text-sm font-mono text-[var(--text-primary)]">
              {request.content_type || 'Not specified'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-[var(--text-secondary)] mt-0.5" />
          <div className="flex-1">
            <div className="text-xs text-[var(--text-secondary)] mb-1">Size</div>
            <div className="text-sm text-[var(--text-primary)]">{formatBytes(totalSize)}</div>
          </div>
        </div>
      </div>

      {/* Body Preview */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">Body Preview</h3>
        <div className="bg-[var(--background)] border border-[var(--border)] rounded p-3">
          <pre className="text-xs font-mono text-[var(--text-primary)] whitespace-pre-wrap break-all">
            {bodyPreview}
          </pre>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <CopyButton text={exportAsCurl(request)} label="Copy as cURL" />
        <button
          onClick={() => exportAsJSON(request)}
          className="px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] bg-[var(--background)] border border-[var(--border)] rounded hover:bg-[var(--surface)] transition-colors"
        >
          Export as JSON
        </button>
      </div>
    </div>
  );
}
