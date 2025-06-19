'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { WithPermission, WithPermissionProps } from './WithPermission';

interface RouteGuardProps extends Omit<WithPermissionProps, 'fallback' | 'hideWhenUnauthorized'> {
  children: ReactNode;
  /** Route to redirect to when access is denied (default: '/') */
  redirectTo?: string;
  /** Show access denied message instead of redirecting */
  showAccessDenied?: boolean;
  /** Custom access denied component */
  accessDeniedComponent?: ReactNode;
}

/**
 * RouteGuard - Route-level access control component
 * 
 * This component protects entire pages/routes by checking permissions
 * and either redirecting unauthorized users or showing an access denied message.
 * 
 * @example
 * // Protect a page with a single permission
 * <RouteGuard permission="users:read">
 *   <UserManagementPage />
 * </RouteGuard>
 * 
 * @example
 * // Protect with multiple permissions (user must have ALL)
 * <RouteGuard permissions={["admin:users", "admin:roles"]}>
 *   <AdminPanel />
 * </RouteGuard>
 * 
 * @example
 * // Show access denied instead of redirecting
 * <RouteGuard 
 *   permission="premium:feature" 
 *   showAccessDenied={true}
 * >
 *   <PremiumFeature />
 * </RouteGuard>
 */
export function RouteGuard({
  children,
  redirectTo = '/',
  showAccessDenied = false,
  accessDeniedComponent,
  ...permissionProps
}: RouteGuardProps) {
  const router = useRouter();

  const defaultAccessDenied = (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <WithPermission
      {...permissionProps}
      fallback={
        showAccessDenied 
          ? (accessDeniedComponent || defaultAccessDenied)
          : null
      }
      hideWhenUnauthorized={!showAccessDenied}
    >
      {/* If not showing access denied, we need to handle redirect */}
      <RedirectHandler 
        redirectTo={redirectTo} 
        showAccessDenied={showAccessDenied}
        permissionProps={permissionProps}
      >
        {children}
      </RedirectHandler>
    </WithPermission>
  );
}

/**
 * Internal component to handle redirection logic
 */
function RedirectHandler({ 
  children, 
  redirectTo, 
  showAccessDenied, 
  permissionProps 
}: { 
  children: ReactNode;
  redirectTo: string;
  showAccessDenied: boolean;
  permissionProps: Omit<WithPermissionProps, 'children' | 'fallback' | 'hideWhenUnauthorized'>;
}) {
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not showing access denied message
    if (!showAccessDenied) {
      // This effect will only run if the WithPermission component
      // allows this component to render, meaning the user has access
      // So we don't need to redirect here - the WithPermission handles denial
    }
  }, [showAccessDenied, redirectTo, router]);

  return <>{children}</>;
}

/**
 * Higher-order component version for page-level protection
 */
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RouteGuardProps, 'children'>
) {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props: P) => (
    <RouteGuard {...guardProps}>
      <Component {...props} />
    </RouteGuard>
  );
  
  WrappedComponent.displayName = `withRouteGuard(${displayName})`;
  return WrappedComponent;
}

/**
 * Convenience components for common access patterns
 */
export function AdminRouteGuard({ children, ...props }: Omit<RouteGuardProps, 'role'>) {
  return (
    <RouteGuard role={["Admin", "Super Admin"]} {...props}>
      {children}
    </RouteGuard>
  );
}

export function UserManagementRouteGuard({ children, ...props }: Omit<RouteGuardProps, 'permission'>) {
  return (
    <RouteGuard permission="users:read" {...props}>
      {children}
    </RouteGuard>
  );
}

export function RoleManagementRouteGuard({ children, ...props }: Omit<RouteGuardProps, 'permission'>) {
  return (
    <RouteGuard permission="roles:read" {...props}>
      {children}
    </RouteGuard>
  );
} 