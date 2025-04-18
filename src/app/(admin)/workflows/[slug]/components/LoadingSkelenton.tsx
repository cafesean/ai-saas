import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function WorkflowDetailLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
          href="/workflows"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Workflows</span>
        </Link>
        <Skeleton className="h-6 w-48" />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-96 mb-4" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-4">
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>

            <Card className="p-4">
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>

            <Card className="p-4">
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          </div>

          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="flex gap-6 flex-wrap">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-48 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
