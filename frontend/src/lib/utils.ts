/**
 * Utility functions for Hookshot frontend
 */

import type { HttpMethod } from './types.ts'

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

/**
 * Get a color class for HTTP method badges
 */
export function getMethodColor(method: HttpMethod): string {
  const colors: Record<HttpMethod, string> = {
    GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    POST: 'bg-green-500/10 text-green-400 border-green-500/20',
    PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
    HEAD: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    OPTIONS: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  }
  return colors[method] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Combine class names conditionally
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Group requests by time periods
 */
export function groupRequestsByTime<T extends { received_at: string }>(
  requests: T[]
): { label: string; requests: T[] }[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  const groups: { label: string; requests: T[] }[] = [
    { label: 'Today', requests: [] },
    { label: 'Yesterday', requests: [] },
    { label: 'Last 7 days', requests: [] },
    { label: 'Older', requests: [] },
  ]

  for (const request of requests) {
    const date = new Date(request.received_at)

    if (date >= today) {
      groups[0].requests.push(request)
    } else if (date >= yesterday) {
      groups[1].requests.push(request)
    } else if (date >= lastWeek) {
      groups[2].requests.push(request)
    } else {
      groups[3].requests.push(request)
    }
  }

  // Filter out empty groups
  return groups.filter((group) => group.requests.length > 0)
}
