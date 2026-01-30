/**
 * Export utilities for request data
 */

import type { WebhookRequest } from './types';

/**
 * Export request as JSON file
 */
export function exportAsJSON(request: WebhookRequest) {
  const json = JSON.stringify(request, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `request-${request.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate cURL command from request
 */
export function exportAsCurl(request: WebhookRequest): string {
  const headers = Object.entries(request.headers)
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' \\\n  ');

  const body = request.body
    ? `-d '${request.body.replace(/'/g, "\\'")}'`
    : '';

  const url = `${window.location.origin}${request.path}${
    request.query_string ? '?' + request.query_string : ''
  }`;

  return `curl -X ${request.method} \\\n  ${headers}${body ? ' \\\n  ' + body : ''} \\\n  "${url}"`;
}

/**
 * Export request as HTTP raw format
 */
export function exportAsHTTPRaw(request: WebhookRequest): string {
  const queryString = request.query_string ? `?${request.query_string}` : '';
  const headers = Object.entries(request.headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `${request.method} ${request.path}${queryString} HTTP/1.1\n${headers}\n\n${request.body || ''}`;
}

/**
 * Get programming language from content type for syntax highlighting
 */
export function getLanguageFromContentType(contentType?: string): string {
  if (!contentType) return 'text';
  const lower = contentType.toLowerCase();

  if (lower.includes('json')) return 'json';
  if (lower.includes('xml')) return 'xml';
  if (lower.includes('html')) return 'html';
  if (lower.includes('javascript')) return 'javascript';
  if (lower.includes('typescript')) return 'typescript';
  if (lower.includes('css')) return 'css';
  if (lower.includes('yaml') || lower.includes('yml')) return 'yaml';

  return 'text';
}

/**
 * Format body content based on language
 */
export function formatBody(body: string, language: string): string {
  if (language === 'json') {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }
  return body;
}

/**
 * Format byte size to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format timestamp to readable format
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}
