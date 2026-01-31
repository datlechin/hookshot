import { Loader2 } from 'lucide-react'

export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-(--accent-blue)" />
        <p className="text-sm text-(--text-secondary)">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return <Loader2 className={`animate-spin text-(--accent-blue) ${sizeClasses[size]}`} />
}
