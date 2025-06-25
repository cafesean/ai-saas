"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import type { ExtendedSession, ExtendedUser } from "../../db/auth-hydration";

/**
 * Custom hook that provides pure session-based authentication
 * 
 * This hook directly uses NextAuth session without any client-side state management.
 * All authentication state comes from the JWT session.
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
 *       {hasPermission('workflows:create') && (
 *         <button>Create Workflow</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuthSession() {
  const { data: session, status } = useSession();
  
  // Cast session to our extended type
  const extendedSession = session as ExtendedSession | null;

  // Memoized computed values based on session
  const computedValues = useMemo(() => {
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated" && !!extendedSession?.user;
    const user = extendedSession?.user || null;
    const roles = user?.roles || [];
    const primaryRole = roles[0] || null;
    
    // Extract all permissions from roles
    const permissions = roles.flatMap(role => 
      role.policies?.map(policy => ({
        id: `${policy.id || role.id}-${policy.name}`,
        slug: policy.name,
        name: policy.description || policy.name,
        category: policy.name.split(':')[0] || 'general',
      })) || []
    );
    
    // Permission checking functions
    const hasPermission = (slug: string): boolean => {
      return permissions.some(p => p.slug === slug);
    };
    
    const hasAnyPermission = (slugs: string[]): boolean => {
      return slugs.some(slug => hasPermission(slug));
    };
    
    const hasAllPermissions = (slugs: string[]): boolean => {
      return slugs.every(slug => hasPermission(slug));
    };
    
    const hasRole = (roleName: string): boolean => {
      return roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
    };

    return {
      isLoading,
      isAuthenticated,
      isUnauthenticated: status === "unauthenticated" || !isAuthenticated,
      user,
      roles,
      primaryRole,
      permissions,
      session: extendedSession,
      sessionStatus: status,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      // Convenience methods
      checkPermission: hasPermission,
      checkMultiplePermissions: hasAllPermissions,
      checkAnyPermission: hasAnyPermission,
    };
  }, [extendedSession, status]);

  return computedValues;
}

/**
 * Hook for checking a single permission without full auth session data
 * 
 * Usage:
 * ```tsx
 * function PermissionButton() {
 *   const canCreate = usePermission('workflows:create');
 *   
 *   if (!canCreate) return null;
 *   
 *   return <button>Create Workflow</button>;
 * }
 * ```
 */
export function usePermission(slug: string): boolean {
  const { hasPermission } = useAuthSession();
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
 *     'users:create'
 *   ]);
 *   
 *   if (!hasAny) return <div>Access denied</div>;
 *   
 *   return (
 *     <div>
 *       {hasAll && <div>Full admin access</div>}
 *       {permissions['users:create'] && <button>Create User</button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions(slugs: string[]) {
  const { hasPermission, permissions: userPermissions } = useAuthSession();
  
  return useMemo(() => {
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
  }, [slugs, hasPermission, userPermissions]);
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
  const { user, primaryRole, isLoading, isAuthenticated } = useAuthSession();
  
  return {
    user,
    role: primaryRole,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Utility functions for server-side or imperative access to session data
 */
export const AuthUtils = {
  /**
   * Extract permissions from a session object
   */
  getPermissionsFromSession: (session: ExtendedSession | null): string[] => {
    if (!session?.user?.roles) return [];
    
    return session.user.roles.flatMap(role => 
      role.policies?.map(policy => policy.name) || []
    );
  },
  
  /**
   * Check if session has a specific permission
   */
  sessionHasPermission: (session: ExtendedSession | null, slug: string): boolean => {
    const permissions = AuthUtils.getPermissionsFromSession(session);
    return permissions.includes(slug);
  },
  
  /**
   * Check if session has any of the provided permissions
   */
  sessionHasAnyPermission: (session: ExtendedSession | null, slugs: string[]): boolean => {
    const permissions = AuthUtils.getPermissionsFromSession(session);
    return slugs.some(slug => permissions.includes(slug));
  },
  
  /**
   * Check if session has all of the provided permissions
   */
  sessionHasAllPermissions: (session: ExtendedSession | null, slugs: string[]): boolean => {
    const permissions = AuthUtils.getPermissionsFromSession(session);
    return slugs.every(slug => permissions.includes(slug));
  },
  
  /**
   * Check if session has a specific role
   */
  sessionHasRole: (session: ExtendedSession | null, roleName: string): boolean => {
    if (!session?.user?.roles) return false;
    return session.user.roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
  },
}; 