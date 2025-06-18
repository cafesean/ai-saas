"use client";

import React from "react";
import { usePermission, usePermissions } from "@/framework/hooks/useAuthSession";
import { useAuthStore, UserProfile, UserRole } from "@/framework/store/auth.store";
import { AuthError } from "@/types/auth";

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
  customCheck?: (user: UserProfile, role: UserRole | null, permissions: string[]) => boolean;
  
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
 * roles, or custom authorization logic.
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
  // Get auth state from store
  const { 
    user, 
    role: userRole, 
    permissions: userPermissions, 
    authenticated, 
    loading,
    hasPermission,
    hasAnyPermission
  } = useAuthStore();

  // Handle loading state
  if (loading && showLoading) {
    return <div className={className}>{loadingComponent}</div>;
  }

  // If not authenticated, always deny access
  if (!authenticated || !user) {
    if (hideWhenUnauthorized) return null;
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  // Check permissions using the auth store methods (same as other modules)
  let hasAccess = true;

  // Custom check takes precedence
  if (customCheck) {
    const permissionSlugs = userPermissions.map(p => p.slug);
    hasAccess = customCheck(user, userRole, permissionSlugs);
  }
  // Check single permission
  else if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Check multiple permissions (user must have ALL)
  else if (permissions.length > 0) {
    hasAccess = permissions.every(perm => hasPermission(perm));
  }
  // Check any permissions (user must have at least ONE)
  else if (anyPermissions.length > 0) {
    hasAccess = hasAnyPermission(anyPermissions);
  }
  // Check role(s)
  else if (role) {
    if (!userRole) {
      hasAccess = false;
    } else if (Array.isArray(role)) {
      hasAccess = role.includes(userRole.name);
    } else {
      hasAccess = userRole.name === role;
    }
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
  const { 
    user, 
    role: userRole, 
    permissions: userPermissions, 
    authenticated,
    loading,
    hasPermission,
    hasAnyPermission
  } = useAuthStore();

  // If loading or not authenticated, deny access
  if (loading || !authenticated || !user) {
    return false;
  }

  const { permission, permissions = [], anyPermissions = [], role, customCheck } = props;

  // Custom check takes precedence
  if (customCheck) {
    const permissionSlugs = userPermissions.map(p => p.slug);
    return customCheck(user, userRole, permissionSlugs);
  }
  // Check single permission
  if (permission) {
    return hasPermission(permission);
  }
  // Check multiple permissions (user must have ALL)
  if (permissions.length > 0) {
    return permissions.every(perm => hasPermission(perm));
  }
  // Check any permissions (user must have at least ONE)
  if (anyPermissions.length > 0) {
    return hasAnyPermission(anyPermissions);
  }
  // Check role(s)
  if (role) {
    if (!userRole) return false;
    if (Array.isArray(role)) {
      return role.includes(userRole.name);
    }
    return userRole.name === role;
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
 * Utility components for common use cases
 */

/**
 * AdminOnly - Quick component for admin-only content
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
      role="Admin" 
      fallback={fallback}
      hideWhenUnauthorized={!fallback}
    >
      {children}
    </WithPermission>
  );
}

/**
 * SuperAdminOnly - Quick component for super admin content
 */
export function SuperAdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <WithPermission 
      role="Super Admin" 
      fallback={fallback}
      hideWhenUnauthorized={!fallback}
    >
      {children}
    </WithPermission>
  );
}

/**
 * RequirePermissions - Quick component for permission-based content
 */
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
    <WithPermission 
      {...permissionProps}
      fallback={fallback}
      hideWhenUnauthorized={!fallback}
    >
      {children}
    </WithPermission>
  );
}

export default WithPermission;