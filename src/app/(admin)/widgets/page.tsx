// This is a server component
import { Suspense } from "react";
import { WidgetsContent } from "./components/widgets-content";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { ErrorBoundary } from "@/components/error-boundary";

// This prevents Next.js from attempting to statically optimize this page
export const dynamic = "force-dynamic";

export default function WidgetsPage() {
  return (
    <div className="container py-6 max-w-full">
      <ErrorBoundary
        fallback={<div>Error loading widgets. Please try again.</div>}
      >
        <Suspense fallback={<TableSkeleton />}>
          <WidgetsContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
