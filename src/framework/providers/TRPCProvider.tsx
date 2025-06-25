'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { loggerLink, unstable_httpBatchStreamLink } from '@trpc/client';
import { api, getBaseUrl } from '@/utils/trpc';
import type { ExtendedSession } from '@/db/auth-hydration';

import { getSession } from 'next-auth/react';
import superjson from 'superjson';



export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: unknown) => {
          // Don't retry on 404s or other client errors
          if (
            typeof error === 'object' && 
            error !== null && 
            'data' in error && 
            typeof error.data === 'object' && 
            error.data !== null && 
            'httpStatus' in error.data && 
            typeof error.data.httpStatus === 'number' && 
            error.data.httpStatus >= 400 && 
            error.data.httpStatus < 500
          ) {
            return false;
          }
          return failureCount < 3;
        },
      },
      mutations: {
        retry: false,
      },
    },
  }));

  const [trpcClient] = React.useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          headers: async () => {
            // Include session token in headers for server-side authentication
            if (typeof window !== "undefined") {
              // Client-side: get session from NextAuth
              const session = await getSession() as ExtendedSession | null;
              if (session?.user?.id) {
                return {
                  "x-user-id": session.user.id.toString(),
                  "x-org-id": session.user.orgId?.toString() || "1",
                  "x-session-token": "authenticated",
                };
              }
            }
            return {};
          },
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </api.Provider>
  );
} 