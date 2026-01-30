/**
 * Button component using pure Tailwind CSS
 */

import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils.ts'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      default: 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)]',
      primary: 'bg-[var(--accent-blue)] hover:bg-blue-600 text-white border border-transparent',
      secondary: 'bg-[var(--accent-green)] hover:bg-green-600 text-white border border-transparent',
      outline: 'bg-transparent hover:bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)]',
      ghost: 'bg-transparent hover:bg-[var(--surface)] text-[var(--text-primary)] border border-transparent',
      danger: 'bg-[var(--accent-red)] hover:bg-red-600 text-white border border-transparent',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
