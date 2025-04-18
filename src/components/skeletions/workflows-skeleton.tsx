import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface WorkflowsSkeletonProps {
  count?: number;
  className?: string;
}

export function WorkflowsSkeleton({
  count = 6,
  className = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
}: WorkflowsSkeletonProps) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>

            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-5" />

            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="border-t pt-3">
              <Skeleton className="h-4 w-28 mb-2" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
