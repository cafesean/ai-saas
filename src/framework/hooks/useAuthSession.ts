"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthHydration, stopSessionMonitoring } from "@/db/auth-hydration";
import { useAuthStore } from "@/framework/store/auth.store";

/**
 * Custom hook that integrates NextAuth session with our RBAC auth store
 * 
 * This hook automatically:
 * - Hydrates the auth store when session changes
 * - Starts session monitoring when authenticated
 * - Cleans up session monitoring on logout
 * - Provides loading states and auth status
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { isLoading, isAuthenticated, user, hasPermission } = useAuthSession();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isAuthenticated) return <div>Please log in</div>;
 *   
 *   return (
 *     <div>
 *       Welcome {user?.name}!
 *       {hasPermission('workflow:create') && (
 *         <button>Create Workflow</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuthSession() {
  const { data: session, status } = useSession();
  const { 
    authenticated, 
    loading: storeLoading, 
    user, 
    role, 
    permissions,
    hasPermission 
  } = useAuthStore();

  // Hydrate the auth store when session changes
  useAuthHydration(session, status);

  // Handle cleanup when component unmounts or user logs out
  useEffect(() => {
    return () => {
      // Clean up session monitoring if the component unmounts
      // and the user is not authenticated
      if (!authenticated) {
        stopSessionMonitoring();
      }
    };
  }, [authenticated]);

  // Determine overall loading state
  const isLoading = status === "loading" || storeLoading;
  
  // Determine authentication state
  const isAuthenticated = status === "authenticated" && authenticated && !!user;

  return {
    // Loading state
    isLoading,
    
    // Authentication state
    isAuthenticated,
    isUnauthenticated: status === "unauthenticated" || !authenticated,
    
    // User data
    user,
    role,
    permissions,
    
    // Session data
    session,
    sessionStatus: status,
    
    // Permission helpers
    hasPermission,
    
    // Utility functions
    checkPermission: (slug: string) => hasPermission(slug),
    checkMultiplePermissions: (slugs: string[]) => slugs.every(slug => hasPermission(slug)),
    checkAnyPermission: (slugs: string[]) => slugs.some(slug => hasPermission(slug)),
  };
}

/**
 * Hook for checking permissions without full auth session data
 * Useful for small components that only need permission checking
 * 
 * Usage:
 * ```tsx
 * function PermissionButton() {
 *   const canCreate = usePermission('workflow:create');
 *   
 *   if (!canCreate) return null;
 *   
 *   return <button>Create Workflow</button>;
 * }
 * ```
 */
export function usePermission(slug: string): boolean {
  const { hasPermission } = useAuthStore();
  return hasPermission(slug);
}

/**
 * Hook for checking multiple permissions
 * 
 * Usage:
 * ```tsx
 * function AdminPanel() {
 *   const { hasAll, hasAny, permissions } = usePermissions([
 *     'admin:full_access',
 *     'admin:role_management',
 *     'user:create'
 *   ]);
 *   
 *   if (!hasAny) return <div>Access denied</div>;
 *   
 *   return (
 *     <div>
 *       {hasAll && <div>Full admin access</div>}
 *       {permissions['user:create'] && <button>Create User</button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions(slugs: string[]) {
  const { hasPermission, permissions: userPermissions } = useAuthStore();
  
  const permissions = slugs.reduce((acc, slug) => {
    acc[slug] = hasPermission(slug);
    return acc;
  }, {} as Record<string, boolean>);
  
  const hasAll = slugs.every(slug => hasPermission(slug));
  const hasAny = slugs.some(slug => hasPermission(slug));
  const hasNone = !hasAny;
  
  return {
    permissions,
    hasAll,
    hasAny,
    hasNone,
    userPermissions,
  };
}

/**
 * Hook for getting current user data
 * 
 * Usage:
 * ```tsx
 * function UserProfile() {
 *   const { user, role, isLoading } = useCurrentUser();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!user) return <div>Not logged in</div>;
 *   
 *   return (
 *     <div>
 *       <h1>{user.name}</h1>
 *       <p>Role: {role?.name}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCurrentUser() {
  const { user, role, loading, authenticated } = useAuthStore();
  
  return {
    user,
    role,
    isLoading: loading,
    isAuthenticated: authenticated && !!user,
  };
} 