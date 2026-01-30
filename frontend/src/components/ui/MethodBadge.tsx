/**
 * MethodBadge component for displaying HTTP methods with color coding
 */

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export function MethodBadge({ method, className = '' }: MethodBadgeProps) {
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'POST':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'PUT':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'PATCH':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'DELETE':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HEAD':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'OPTIONS':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-semibold border rounded ${getMethodColor(
        method
      )} ${className}`}
    >
      {method.toUpperCase()}
    </span>
  );
}
