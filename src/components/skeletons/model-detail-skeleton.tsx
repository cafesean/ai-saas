import { Skeleton } from "@/components/ui/skeleton";

export const ModelDetailSkeleton = () => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Skeleton className="h-4 w-24" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </header>

      <div className="border-b bg-muted/40">
        <div className="container py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container py-6 space-y-8">
        <Skeleton className="h-10 w-full max-w-md" />

        <div className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {Array(2)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-80 w-full" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};
