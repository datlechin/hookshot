/**
 * Select component using pure Tailwind CSS
 */

import { type SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-(--text-secondary) mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-lg border bg-(--surface) text-(--text-primary)',
            'focus:outline-none focus:ring-2 focus:ring-(--accent-blue) focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors cursor-pointer',
            error ? 'border-(--accent-red) focus:ring-(--accent-red)' : 'border-(--border)',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-sm text-(--accent-red)">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-(--text-tertiary)">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
