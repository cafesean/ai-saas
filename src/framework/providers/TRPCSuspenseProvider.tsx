"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/utils/trpc";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

interface SuspenseProviderProps {
  children: ReactNode;
}

export default function TRPCSuspenseProvider({
  children,
}: SuspenseProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000, // 5 seconds
            refetchOnWindowFocus: false,
            retry: 1,
            // Explicitly cast to any to avoid TypeScript error
            // This is safe because we know React Query supports suspense
            // but TypeScript definitions might be outdated
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/trpc`,
        }),
      ],
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient as any}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
