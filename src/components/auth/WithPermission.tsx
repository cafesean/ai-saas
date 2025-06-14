"use client";

import React from "react";
import { usePermission, usePermissions } from "@/framework/hooks/useAuthSession";
import { useAuthStore } from "@/framework/store/auth.store";

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
    loading 
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

  // Check permissions based on provided props
  const hasAccess = checkPermissions({
    permission,
    permissions,
    anyPermissions,
    role,
    customCheck,
    user,
    userRole,
    userPermissions,
  });

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
    loading 
  } = useAuthStore();

  // If loading or not authenticated, deny access
  if (loading || !authenticated || !user) {
    return false;
  }

  return checkPermissions({
    ...props,
    user,
    userRole,
    userPermissions,
  });
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
 * Internal function to check permissions based on various criteria
 */
function checkPermissions({
  permission,
  permissions = [],
  anyPermissions = [],
  role,
  customCheck,
  user,
  userRole,
  userPermissions,
}: {
  permission?: string;
  permissions?: string[];
  anyPermissions?: string[];
  role?: string | string[];
  customCheck?: (user: any, role: any, permissions: string[]) => boolean;
  user: any;
  userRole: any;
  userPermissions: string[];
}): boolean {
  // Custom check takes precedence
  if (customCheck) {
    return customCheck(user, userRole, userPermissions);
  }

  // Check single permission
  if (permission) {
    return userPermissions.includes(permission);
  }

  // Check multiple permissions (user must have ALL)
  if (permissions.length > 0) {
    return permissions.every(perm => userPermissions.includes(perm));
  }

  // Check any permissions (user must have at least ONE)
  if (anyPermissions.length > 0) {
    return anyPermissions.some(perm => userPermissions.includes(perm));
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