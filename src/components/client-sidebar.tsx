"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading state

// Dynamically import the actual Sidebar component with SSR disabled
const Sidebar = dynamic(
  () => import("@/components/Sidebar").then((mod) => mod.Sidebar),
  {
    ssr: false,
    // Use Skeleton components for a better loading state
    loading: () => (
      <div className="w-64 border-r p-2 space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    ),
  },
);

export function ClientSidebar() {
  // This component simply renders the dynamically imported Sidebar
  return <Sidebar />;
}
