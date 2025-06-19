"use client";

import React from "react";
import { useSession } from "next-auth/react";

/**
 * Props for the WithPermission component
 */
export interface WithPermissionProps {
  /** Single permission slug required to show content */
  permission?: string;
  
  /** Array of permission slugs - content shown if user has ALL permissions */
  permissions?: string[];
  
  /** Array of permission slugs - content shown if user has ANY permission */
  anyPermissions?: string[];
  
  /** Role name(s) required to show content */
  role?: string | string[];
  
  /** Content to render when user has required permissions */
  children: React.ReactNode;
  
  /** Content to render when user lacks permissions (optional) */
  fallback?: React.ReactNode;
  
  /** Whether to render nothing (null) instead of fallback when unauthorized */
  hideWhenUnauthorized?: boolean;
  
  /** Custom permission check function for complex logic */
  customCheck?: (user: any, role: any, permissions: string[]) => boolean;
  
  /** Additional class names for styling */
  className?: string;
  
  /** Whether to show loading state while permissions are being checked */
  showLoading?: boolean;
  
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
}

/**
 * WithPermission - A flexible UI gating component for RBAC
 * 
 * This component conditionally renders its children based on user permissions,
 * roles, or custom authorization logic using NextAuth session directly.
 * 
 * @example
 * // Basic permission check
 * <WithPermission permission="workflow:create">
 *   <CreateWorkflowButton />
 * </WithPermission>
 * 
 * @example
 * // Multiple permissions (user must have ALL)
 * <WithPermission permissions={["admin:users", "admin:roles"]}>
 *   <AdminPanel />
 * </WithPermission>
 * 
 * @example
 * // Any permission (user must have at least ONE)
 * <WithPermission anyPermissions={["workflow:read", "workflow:create"]}>
 *   <WorkflowList />
 * </WithPermission>
 * 
 * @example
 * // Role-based access
 * <WithPermission role="Admin">
 *   <AdminSettings />
 * </WithPermission>
 * 
 * @example
 * // Custom authorization logic
 * <WithPermission 
 *   customCheck={(user, role, permissions) => 
 *     user?.tenantId === "specific-tenant" && permissions.includes("tenant:admin")
 *   }
 * >
 *   <TenantSpecificContent />
 * </WithPermission>
 * 
 * @example
 * // With fallback content
 * <WithPermission 
 *   permission="premium:feature"
 *   fallback={<UpgradePrompt />}
 * >
 *   <PremiumFeature />
 * </WithPermission>
 */
export function WithPermission({
  permission,
  permissions = [],
  anyPermissions = [],
  role,
  children,
  fallback = null,
  hideWhenUnauthorized = false,
  customCheck,
  className = "",
  showLoading = false,
  loadingComponent = <div className="animate-pulse">Loading...</div>,
}: WithPermissionProps) {
  const { data: session, status } = useSession();

  // Handle loading state
  if (status === 'loading' && showLoading) {
    return <div className={className}>{loadingComponent}</div>;
  }

  // If not authenticated, always deny access
  if (status !== 'authenticated' || !session?.user) {
    if (hideWhenUnauthorized) return null;
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  // Extract permissions from session
  const userPermissions = session.user.roles?.flatMap(role => 
    role.policies?.map(policy => policy.name) || []
  ) || [];

  // Helper functions
  const hasPermissionCheck = (perm: string) => {
    return userPermissions.includes(perm) || userPermissions.includes('admin:full_access');
  };

  const hasAnyPermissionCheck = (perms: string[]) => {
    return perms.some(perm => hasPermissionCheck(perm));
  };

  // Check permissions
  let hasAccess = true;

  // Custom check takes precedence
  if (customCheck) {
    const primaryRole = session.user.roles?.[0];
    hasAccess = customCheck(session.user, primaryRole, userPermissions);
  }
  // Check single permission
  else if (permission) {
    hasAccess = hasPermissionCheck(permission);
  }
  // Check multiple permissions (user must have ALL)
  else if (permissions.length > 0) {
    hasAccess = permissions.every(perm => hasPermissionCheck(perm));
  }
  // Check any permissions (user must have at least ONE)
  else if (anyPermissions.length > 0) {
    hasAccess = hasAnyPermissionCheck(anyPermissions);
  }
  // Check role(s)
  else if (role) {
    const primaryRole = session.user.roles?.[0];
    if (!primaryRole) {
      hasAccess = false;
    } else if (Array.isArray(role)) {
      hasAccess = role.includes(primaryRole.name);
    } else {
      hasAccess = primaryRole.name === role;
    }
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development' && permission) {
    console.log('WithPermission Client Debug:', {
      requiredPermission: permission,
      userPermissionsCount: userPermissions.length,
      hasRequiredPermission: userPermissions.includes(permission),
      hasAdminFullAccess: userPermissions.includes('admin:full_access'),
      hasAccess,
      userEmail: session.user.email,
      sessionStatus: status
    });
  }

  // Render based on access
  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // User lacks required permissions
  if (hideWhenUnauthorized) {
    return null;
  }

  return fallback ? <div className={className}>{fallback}</div> : null;
}

/**
 * Hook version of WithPermission for more complex component logic
 * 
 * @example
 * function MyComponent() {
 *   const canCreate = useWithPermission({ permission: "workflow:create" });
 *   const canEdit = useWithPermission({ permissions: ["workflow:update", "workflow:read"] });
 *   
 *   return (
 *     <div>
 *       {canCreate && <CreateButton />}
 *       {canEdit && <EditButton />}
 *     </div>
 *   );
 * }
 */
export function useWithPermission(props: Omit<WithPermissionProps, 'children' | 'fallback' | 'hideWhenUnauthorized' | 'className' | 'showLoading' | 'loadingComponent'>) {
  const { data: session, status } = useSession();

  // If loading or not authenticated, deny access
  if (status === 'loading' || status !== 'authenticated' || !session?.user) {
    return false;
  }

  const { permission, permissions = [], anyPermissions = [], role, customCheck } = props;

  // Extract permissions from session
  const userPermissions = session.user.roles?.flatMap(role => 
    role.policies?.map(policy => policy.name) || []
  ) || [];

  // Helper functions
  const hasPermissionCheck = (perm: string) => {
    return userPermissions.includes(perm) || userPermissions.includes('admin:full_access');
  };

  const hasAnyPermissionCheck = (perms: string[]) => {
    return perms.some(perm => hasPermissionCheck(perm));
  };

  // Custom check takes precedence
  if (customCheck) {
    const primaryRole = session.user.roles?.[0];
    return customCheck(session.user, primaryRole, userPermissions);
  }
  // Check single permission
  if (permission) {
    return hasPermissionCheck(permission);
  }
  // Check multiple permissions (user must have ALL)
  if (permissions.length > 0) {
    return permissions.every(perm => hasPermissionCheck(perm));
  }
  // Check any permissions (user must have at least ONE)
  if (anyPermissions.length > 0) {
    return hasAnyPermissionCheck(anyPermissions);
  }
  // Check role(s)
  if (role) {
    const primaryRole = session.user.roles?.[0];
    if (!primaryRole) return false;
    if (Array.isArray(role)) {
      return role.includes(primaryRole.name);
    }
    return primaryRole.name === role;
  }

  // If no specific criteria provided, default to authenticated
  return true;
}

/**
 * Higher-order component version of WithPermission
 * 
 * @example
 * const ProtectedComponent = withPermission(MyComponent, {
 *   permission: "admin:access",
 *   fallback: <AccessDenied />
 * });
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissionProps: Omit<WithPermissionProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <WithPermission {...permissionProps}>
        <Component {...props} />
      </WithPermission>
    );
  };
}

/**
 * Convenience components for common access patterns
 */
export function AdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <WithPermission 
      anyPermissions={["admin:full_access", "admin:role_management"]}
      fallback={fallback}
    >
      {children}
    </WithPermission>
  );
}

export function SuperAdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <WithPermission 
      role={["Super Admin", "Owner"]}
      fallback={fallback}
    >
      {children}
    </WithPermission>
  );
}

export function RequirePermissions({ 
  permissions, 
  children, 
  fallback = null 
}: { 
  permissions: string | string[]; 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  const permissionProps = Array.isArray(permissions) 
    ? { permissions } 
    : { permission: permissions };
    
  return (
    <WithPermission {...permissionProps} fallback={fallback}>
      {children}
    </WithPermission>
  );
}

export default WithPermission;