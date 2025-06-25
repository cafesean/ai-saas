# Session-Based Authentication Migration

## Overview

The authentication system has been migrated from Zustand client-side state management to pure JWT session-based authentication. This change improves security, reduces complexity, and aligns with NextAuth best practices.

## Key Changes

### ❌ **REMOVED: Zustand Auth Store**
- No more client-side state management for auth
- No more `useAuthStore` hook
- No more auth state hydration/synchronization

### ✅ **NEW: Pure Session-Based Auth**
- Authentication state comes directly from NextAuth JWT session
- Server-side session validation
- Real-time session updates through JWT refresh

## New Auth API

### Core Hook: `useAuthSession`

```tsx
import { useAuthSession } from '@/framework/hooks/useAuthSession';

function MyComponent() {
  const { 
    isLoading,
    isAuthenticated, 
    user, 
    roles,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole 
  } = useAuthSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      Welcome {user?.name}!
      {hasPermission('workflows:create') && (
        <button>Create Workflow</button>
      )}
    </div>
  );
}
```

### Permission Hooks

```tsx
// Single permission check
const canCreate = usePermission('workflows:create');

// Multiple permissions check
const { hasAll, hasAny, permissions } = usePermissions([
  'workflows:create',
  'workflows:update',
  'workflows:delete'
]);
```

### Utility Functions

```tsx
import { AuthUtils } from '@/framework/hooks/useAuthSession';

// Server-side or imperative permission checks
const hasPermission = AuthUtils.sessionHasPermission(session, 'workflows:create');
const permissions = AuthUtils.getPermissionsFromSession(session);
const userId = AuthUtils.getUserId(session);
const orgId = AuthUtils.getOrgId(session);
```

## Migration Guide

### 1. Replace `useAuthStore` Usage

**Before:**
```tsx
import { useAuthStore } from '@/framework/store/auth.store';

const { authenticated, user, hasPermission } = useAuthStore();
```

**After:**
```tsx
import { useAuthSession } from '@/framework/hooks/useAuthSession';

const { isAuthenticated, user, hasPermission } = useAuthSession();
```

### 2. Replace Auth Hydration

**Before:**
```tsx
import { useAuthHydration } from '@/db/auth-hydration';

useAuthHydration(session, status);
```

**After:**
```tsx
// No hydration needed - just use the hook directly
import { useAuthSession } from '@/framework/hooks/useAuthSession';

const auth = useAuthSession();
```

### 3. Update Permission Checks

**Before:**
```tsx
const { hasPermission } = useAuthStore();
const canEdit = hasPermission('workflows:update');
```

**After:**
```tsx
const canEdit = usePermission('workflows:update');
// OR
const { hasPermission } = useAuthSession();
const canEdit = hasPermission('workflows:update');
```

## Benefits

### 🔒 **Improved Security**
- No client-side auth state that can be tampered with
- Authentication always validated server-side
- Session-based permissions prevent stale permission data

### ⚡ **Better Performance**
- No unnecessary re-renders from Zustand updates
- Reduced bundle size (no Zustand for auth)
- Direct session access without state synchronization

### 🧹 **Simplified Architecture**
- Single source of truth (JWT session)
- No complex state management
- Easier to debug and maintain

### 🔄 **Real-time Updates**
- Permission changes reflect immediately through session refresh
- Role changes trigger automatic re-authentication
- Session revocation works instantly

## Component Integration

The `WithPermission` component already uses session-based auth and requires no changes:

```tsx
<WithPermission permission="workflows:create">
  <CreateWorkflowButton />
</WithPermission>

<WithPermission permissions={["admin:users", "admin:roles"]}>
  <AdminPanel />
</WithPermission>

<WithPermission anyPermissions={["workflows:read", "workflows:create"]}>
  <WorkflowList />
</WithPermission>
```

## Session Structure

The extended session includes all necessary auth data:

```typescript
interface ExtendedSession extends Session {
  user: {
    id: number;
    uuid: string;
    email: string;
    name: string;
    roles: Array<{
      id: number;
      name: string;
      orgId: number;
      policies: Array<{
        name: string; // Permission slug (e.g., "workflows:create")
        description?: string;
      }>;
    }>;
    orgId?: number;
    currentOrg?: { id: number; name: string };
    availableOrgs?: Array<OrgInfo>;
  };
}
```

## Backward Compatibility

Deprecated functions are kept for backward compatibility but will log warnings:

- `hydrateAuthStore()` - now a no-op
- `useAuthHydration()` - now a no-op
- Framework auth-hydration re-exports from main auth module

## Session Monitoring

Real-time session management (revocation, role changes) is still supported:

```tsx
import { startSessionMonitoring, stopSessionMonitoring } from '@/db/auth-hydration';

// Start monitoring when user logs in
startSessionMonitoring(userId);

// Stop monitoring when user logs out
stopSessionMonitoring();
```

## Best Practices

1. **Use `useAuthSession` as the primary auth hook**
2. **Use `usePermission` for single permission checks**
3. **Use `usePermissions` for multiple permission logic**
4. **Use `AuthUtils` for server-side or imperative checks**
5. **Let NextAuth handle session refresh and validation**
6. **Use `WithPermission` component for conditional rendering**

This migration makes the auth system more secure, performant, and maintainable while preserving all existing functionality. 