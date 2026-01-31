/**
 * MethodBadge component for displaying HTTP methods with color coding
 * Uses CSS variables for theme support
 */

interface MethodBadgeProps {
  method: string
  className?: string
}

export function MethodBadge({ method, className = '' }: MethodBadgeProps) {
  const getMethodStyles = (method: string) => {
    const baseStyles = 'inline-flex items-center px-2 py-1 text-xs font-semibold border rounded'

    switch (method.toUpperCase()) {
      case 'GET':
        return `${baseStyles} bg-(--accent-blue)/10 text-(--accent-blue) border-(--accent-blue)/20`
      case 'POST':
        return `${baseStyles} bg-(--accent-green)/10 text-(--accent-green) border-(--accent-green)/20`
      case 'PUT':
        return `${baseStyles} bg-(--accent-orange)/10 text-(--accent-orange) border-(--accent-orange)/20`
      case 'PATCH':
        return `${baseStyles} bg-(--accent-purple)/10 text-(--accent-purple) border-(--accent-purple)/20`
      case 'DELETE':
        return `${baseStyles} bg-(--accent-red)/10 text-(--accent-red) border-(--accent-red)/20`
      case 'HEAD':
        return `${baseStyles} bg-(--accent-yellow)/10 text-(--accent-yellow) border-(--accent-yellow)/20`
      case 'OPTIONS':
        return `${baseStyles} bg-(--accent-yellow)/10 text-(--accent-yellow) border-(--accent-yellow)/20`
      default:
        return `${baseStyles} bg-(--text-secondary)/10 text-(--text-secondary) border-(--text-secondary)/20`
    }
  }

  return <span className={`${getMethodStyles(method)} ${className}`}>{method.toUpperCase()}</span>
}
