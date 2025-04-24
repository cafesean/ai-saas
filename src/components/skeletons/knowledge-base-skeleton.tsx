import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function KnowledgeBaseSkeleton({
  count = 1,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-4 ${
        className || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4 mb-1" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-1" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12 ml-auto" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-10 ml-auto" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-2 bg-muted/20">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
