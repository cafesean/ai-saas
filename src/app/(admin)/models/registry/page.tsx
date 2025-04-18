"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletions/default-skeleton";

export default function ModelRegistryPage() {
  return (
    <div className="flex flex-col grow max-w-[100vw] p-4 md:p-4">
      <ErrorBoundary>
        <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold mb-4">Model Registry</h1>
              <p>This is the model registry page. Content goes here.</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-2 w-full md:w-auto"></div>
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
