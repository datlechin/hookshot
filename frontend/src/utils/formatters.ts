/**
 * Utility functions for formatting display values
 */

/**
 * Format a timestamp as a relative time string (e.g., "2m ago", "5h ago", "3d ago")
 */
export function formatRelativeTime(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Never';

  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 10) return `${seconds}s ago`;
  return 'Just now';
}

/**
 * Format a timestamp as a short date string (e.g., "Jan 15", "Dec 3")
 */
export function formatDate(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Unknown';

  const date = new Date(timestamp);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();

  return `${month} ${day}`;
}

/**
 * Format request count as a compact string (e.g., "3", "42", "1.2K")
 */
export function formatRequestCount(count: number | null | undefined): string {
  if (count === null || count === undefined) return '0';

  if (count >= 1000) {
    const k = (count / 1000).toFixed(1);
    return `${k}K`;
  }

  return count.toString();
}
