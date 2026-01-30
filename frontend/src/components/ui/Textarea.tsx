/**
 * Textarea component using pure Tailwind CSS
 */

import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-lg border bg-[var(--surface)] text-[var(--text-primary)]',
            'placeholder:text-[var(--text-tertiary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors resize-y',
            'font-mono text-sm',
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

Textarea.displayName = 'Textarea'

export { Textarea }
