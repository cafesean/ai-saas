interface TableSkeletonProps {
  columns: number
  rows: number
}

export function TableSkeleton({ columns, rows }: TableSkeletonProps) {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-12 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 bg-gray-200 rounded col-span-3"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
} 