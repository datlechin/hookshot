/**
 * MethodBadge component for displaying HTTP methods with color coding
 * Uses CSS variables for theme support
 */

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export function MethodBadge({ method, className = '' }: MethodBadgeProps) {
  const getMethodStyles = (method: string) => {
    const baseStyles = 'inline-flex items-center px-2 py-1 text-xs font-semibold border rounded';

    switch (method.toUpperCase()) {
      case 'GET':
        return `${baseStyles} bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/20`;
      case 'POST':
        return `${baseStyles} bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-[var(--accent-green)]/20`;
      case 'PUT':
        return `${baseStyles} bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] border-[var(--accent-orange)]/20`;
      case 'PATCH':
        return `${baseStyles} bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] border-[var(--accent-purple)]/20`;
      case 'DELETE':
        return `${baseStyles} bg-[var(--accent-red)]/10 text-[var(--accent-red)] border-[var(--accent-red)]/20`;
      case 'HEAD':
        return `${baseStyles} bg-[var(--accent-yellow)]/10 text-[var(--accent-yellow)] border-[var(--accent-yellow)]/20`;
      case 'OPTIONS':
        return `${baseStyles} bg-[var(--accent-yellow)]/10 text-[var(--accent-yellow)] border-[var(--accent-yellow)]/20`;
      default:
        return `${baseStyles} bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] border-[var(--text-secondary)]/20`;
    }
  };

  return (
    <span className={`${getMethodStyles(method)} ${className}`}>
      {method.toUpperCase()}
    </span>
  );
}
