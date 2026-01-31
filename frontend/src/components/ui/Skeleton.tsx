export function RequestListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
          <div className="w-16 h-6 bg-(--surface-hover) rounded" />
          <div className="flex-1 space-y-2">
            <div className="w-3/4 h-4 bg-(--surface-hover) rounded" />
            <div className="w-1/2 h-3 bg-(--surface-hover) rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DetailPanelSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="w-1/3 h-6 bg-(--surface-hover) rounded" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-full h-4 bg-(--surface-hover) rounded" />
        ))}
      </div>
    </div>
  )
}
