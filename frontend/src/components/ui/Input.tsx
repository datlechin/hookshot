/**
 * Input component using pure Tailwind CSS
 */

import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-lg border bg-[var(--surface)] text-[var(--text-primary)]',
            'placeholder:text-[var(--text-tertiary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            error
              ? 'border-[var(--accent-red)] focus:ring-[var(--accent-red)]'
              : 'border-[var(--border)]',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-[var(--accent-red)]">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[var(--text-tertiary)]">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
