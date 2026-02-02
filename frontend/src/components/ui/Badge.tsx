/**
 * Badge component with CVA-based variants
 */

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center font-medium shrink-0 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-(--accent-blue)/10 text-(--accent-blue)',
        success: 'bg-(--accent-green)/10 text-(--accent-green)',
        warning: 'bg-(--accent-yellow)/10 text-(--accent-yellow)',
        danger: 'bg-(--accent-red)/10 text-(--accent-red)',
        outline: 'border border-(--border) text-(--text-secondary)',
        secondary: 'bg-(--surface-hover) text-(--text-secondary)',
      },
      size: {
        sm: 'text-[10px] px-1 py-0.5 rounded-sm',
        md: 'text-[11px] px-1.5 py-0.5 rounded',
        lg: 'text-xs px-2 py-1 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  )
)

Badge.displayName = 'Badge'
