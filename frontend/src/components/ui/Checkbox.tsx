/**
 * Checkbox component using pure Tailwind CSS
 */

import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex items-start gap-3">
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={cn(
            'mt-0.5 w-4 h-4 rounded border-[var(--border)] bg-[var(--surface)]',
            'text-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue)] focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
            'transition-colors',
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className="block text-sm font-medium text-[var(--text-primary)] cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
