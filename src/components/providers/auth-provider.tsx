'use client';

import { SessionProvider } from 'next-auth/react';
import { type ReactNode } from 'react';
import { useAuthSync } from '@/framework/store/auth.store';

interface AuthProviderProps {
  children: ReactNode;
}

function AuthSyncComponent({ children }: { children: ReactNode }) {
  useAuthSync(); // This will sync the session with our Zustand store
  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AuthSyncComponent>
        {children}
      </AuthSyncComponent>
    </SessionProvider>
  );
} 