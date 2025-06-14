'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { SessionProvider } from 'next-auth/react';
import { api, getBaseUrl } from '@/utils/trpc';
import { useAuthSync } from '@/framework/store/auth.store';
import superjson from 'superjson';

// Auth sync component
function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  useAuthSync(); // This will sync the NextAuth session with our Zustand store
  return <>{children}</>;
}

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
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          headers() {
            return {};
          },
        }),
      ],
    })
  );
  
  return (
    <SessionProvider>
      <api.Provider client={trpcClient} queryClient={queryClient as any}>
        <QueryClientProvider client={queryClient}>
          <AuthSyncProvider>
            {children}
          </AuthSyncProvider>
        </QueryClientProvider>
      </api.Provider>
    </SessionProvider>
  );
} 