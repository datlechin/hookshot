import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

/**
 * Reusable empty state component for displaying placeholder content
 * when no data is available
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="text-(--text-tertiary) mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-(--text-primary) mb-2">{title}</h3>
      <p className="text-(--text-secondary) mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  )
}
