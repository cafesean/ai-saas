'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode, useState } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout for loading state to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') {
        console.error('AuthGuard: Authentication check timed out after 10 seconds');
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    console.log('AuthGuard status change:', { status, hasSession: !!session });
    
    if (status === 'loading') return; // Still loading

    if (status === 'unauthenticated') {
      console.log('AuthGuard: Redirecting to login');
      // Redirect to login page
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      console.log('AuthGuard: User authenticated', { userId: session?.user?.id });
    }
  }, [status, router, session]);

  // Show error state if loading times out
  if (loadingTimeout) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Authentication Error</div>
          <p className="text-sm text-muted-foreground mb-4">
            Authentication check timed out. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Checking authentication...</span>
        </div>
      )
    );
  }

  // Show nothing while redirecting
  if (status === 'unauthenticated') {
    return null;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
} 