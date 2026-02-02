import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonVariants = cva('animate-pulse bg-(--surface-hover)', {
  variants: {
    variant: {
      text: 'h-4 rounded',
      title: 'h-6 rounded',
      circle: 'rounded-full',
      rect: 'rounded',
      line: 'h-3 rounded',
    },
  },
  defaultVariants: {
    variant: 'text',
  },
})

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return <div className={cn(skeletonVariants({ variant, className }))} {...props} />
}

export function RequestListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton variant="rect" className="w-16 h-6" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4" />
            <Skeleton variant="line" className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DetailPanelSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton variant="title" className="w-1/3" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-full" />
        ))}
      </div>
    </div>
  )
}
