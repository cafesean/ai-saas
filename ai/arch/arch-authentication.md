# Authentication Architecture Standards

**Jira Task:** [SAAS-113: Authentication Architecture](https://jira.jetdevs.com/browse/SAAS-113)  
**Epic:** [SAAS-111: Architecture Documentation](https://jira.jetdevs.com/browse/SAAS-111)

## Overview & Purpose

This document defines the current authentication and authorization implementation in the AI SaaS platform. The system uses NextAuth.js with credentials provider, JWT sessions, and a custom RBAC (Role-Based Access Control) system built on Drizzle ORM and PostgreSQL.

## Where to Find Logic

### Core Authentication Files
- **NextAuth Configuration:** `src/server/auth-simple.ts` - Main auth options, JWT/session callbacks, credential validation
- **Client-side Auth Provider:** `src/components/auth/AuthProvider.tsx` - Session sync with Zustand store
- **Auth Store (State Management):** `src/framework/store/auth.store.ts` - Zustand store for auth state
- **Middleware:** `src/middleware.ts` - Security headers (auth middleware currently disabled)

### RBAC Implementation
- **Database Schema:** `src/db/schema/rbac.ts` - Roles, permissions, user-role mappings
- **Permission Components:** `src/components/auth/WithPermission.tsx` - UI permission gating
- **Auth Guards:** `src/components/auth/auth-guard.tsx` - Route protection
- **Auth Hooks:** `src/framework/hooks/useAuthSession.ts` - Custom hooks for auth state

### Authentication Pages
- **Login:** `src/app/(auth)/login/LoginClient.tsx` - Login form and error handling
- **Register:** `src/app/(auth)/register/` - User registration flow
- **Password Reset:** `src/app/(auth)/forgot-password/`, `src/app/(auth)/reset-password/`

## Current Architecture Patterns

### 1. Authentication Flow
```typescript
// Current pattern from LoginClient.tsx
const result = await signIn('credentials', {
  redirect: false,
  email,
  password,
  callbackUrl,
});

// Error handling with user-friendly messages
if (result?.error) {
  switch (result.error) {
    case 'CredentialsSignin':
      errorMessage = 'Invalid email or password.';
      break;
    // ... other cases
  }
  toast.error(errorMessage);
}
```

### 2. Session Management
```typescript
// JWT callback pattern from auth-simple.ts
jwt: async ({ token, user, trigger }) => {
  if (trigger === "signIn" && user) {
    token.sub = user.uuid || user.id.toString();
    token.userId = user.id;
    token.email = user.email;
    // ... populate token with user data
  }
  return token;
}

// Session callback
session: async ({ session, token }) => {
  if (token && session.user) {
    session.user.id = token.userId as number;
    session.user.uuid = token.sub as string;
    // ... populate session from token
  }
  return session;
}
```

### 3. State Synchronization
```typescript
// Pattern from AuthProvider.tsx
useEffect(() => {
  if (status === "authenticated" && session?.user) {
    const userProfile = {
      id: session.user.id?.toString() || '',
      email: session.user.email || '',
      name: session.user.name || undefined,
      image: session.user.avatar || undefined,
    };
    
    setAuthState({
      authenticated: true,
      loading: false,
      user: userProfile,
      role: primaryRole,
      permissions: extractedPermissions,
    });
  }
}, [session, status, setAuthState]);
```

### 4. Permission-Based UI Gating
```typescript
// Using WithPermission component
<WithPermission permission="workflow:create">
  <CreateWorkflowButton />
</WithPermission>

// Using auth store hooks
const { hasPermission, hasRole } = useAuthStore();
const canCreateWorkflow = hasPermission('workflow:create');
const isAdmin = hasRole('Admin');
```

## RBAC System Architecture

### Database Schema
- **Roles:** System roles (Admin, Editor, Viewer) and custom roles
- **Permissions:** Granular permissions with slug format (`resource:action`)
- **Role-Permissions:** Many-to-many mapping between roles and permissions
- **User-Roles:** Tenant-scoped user role assignments

### Permission Patterns
```typescript
// Standard permission naming convention
"workflow:create"     // Create workflows
"workflow:read"       // View workflows
"workflow:update"     // Edit workflows
"workflow:delete"     // Delete workflows
"workflow:publish"    // Publish workflows

// Category-based organization
"decision_table:create"
"model:deploy"
"admin:users"
```

## Security Implementation

### Current Security Features ✅
1. **Password Security:**
   - bcrypt hashing with salt
   - Constant-time comparison to prevent timing attacks
   - Random delays to prevent user enumeration

2. **Session Security:**
   - JWT strategy with 24-hour expiration
   - Secure cookies in production
   - HttpOnly and SameSite cookie flags

3. **Logging Security:**
   - Development-only verbose logging
   - Production error logging without sensitive data
   - Sanitized error messages to users

4. **Headers Security:**
   - Comprehensive CSP policy
   - XSS protection headers
   - Frame options and content sniffing protection

### Session Configuration
```typescript
session: {
  strategy: "jwt",
  maxAge: 24 * 60 * 60,        // 1 day (good security practice)
  updateAge: 60 * 60,          // Update every hour
}

cookies: {
  sessionToken: {
    options: {
      httpOnly: true,            // Prevent XSS
      sameSite: 'lax',          // CSRF protection
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    }
  }
}
```

## Templates & Best Practices

### 1. Creating New Auth-Protected Pages
```typescript
// Use auth-guard for route protection
import { AuthGuard } from '@/components/auth/auth-guard';

export default function ProtectedPage() {
  return (
    <AuthGuard requireAuth>
      <YourPageContent />
    </AuthGuard>
  );
}
```

### 2. Permission Checking in Components
```typescript
// Use WithPermission for conditional rendering
import { WithPermission } from '@/components/auth/WithPermission';

function MyComponent() {
  return (
    <div>
      <WithPermission permission="workflow:create">
        <CreateButton />
      </WithPermission>
      
      <WithPermission 
        anyPermissions={["workflow:read", "workflow:create"]}
        fallback={<AccessDeniedMessage />}
      >
        <WorkflowList />
      </WithPermission>
    </div>
  );
}
```

### 3. Server-Side Permission Checking
```typescript
// Pattern for tRPC procedures
.use(async ({ ctx, next }) => {
  const session = ctx.session;
  if (!session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  
  // Check specific permissions here
  return next({ ctx: { ...ctx, user: session.user } });
})
```

## Anti-Patterns & Common Mistakes

### ❌ Security Anti-Patterns
1. **Client-Side Only Auth Checks** - Always validate on server
2. **Exposing Sensitive Data in Logs** - Current code properly guards this
3. **Hardcoded Credentials** - Use environment variables
4. **Weak Session Management** - Current implementation is secure

### ❌ Implementation Anti-Patterns
1. **Direct Database Queries in Components** - Use tRPC procedures
2. **Inconsistent Permission Naming** - Follow `resource:action` pattern
3. **Missing Error Boundaries** - Wrap auth components properly
4. **Not Handling Loading States** - Always show loading indicators

## Architecture Issues Found

### 🚨 Critical Issues

1. **Middleware Disabled** - `src/middleware.ts` line 62
   ```typescript
   matcher: [], // Temporarily disabled for debugging
   ```
   - **Impact:** No authentication middleware protecting routes
   - **Location:** `src/middleware.ts`
   - **Risk:** High - Unauthenticated access possible

2. **Missing Route Protection**
   - **Impact:** No automatic redirect to login for protected pages
   - **Solution:** Re-enable middleware with proper auth checks

### ⚠️ Medium Priority Issues

1. **Inconsistent Auth State Sync**
   - **Location:** `AuthProvider.tsx` vs `auth.store.ts`
   - **Issue:** Duplicate logic for session -> store conversion
   - **Solution:** Consolidate into single sync mechanism

2. **No Session Refresh Strategy**
   - **Issue:** Sessions expire without graceful renewal
   - **Solution:** Implement token refresh mechanism

3. **Limited User Enumeration Protection**
   - **Current:** Random delays only
   - **Enhancement:** Rate limiting, account lockout policies

### ℹ️ Low Priority Improvements

1. **Add Multi-Factor Authentication (MFA)**
2. **Implement Password Complexity Requirements**
3. **Add Login Attempt Monitoring**
4. **Enhanced Audit Logging**

## Usage Examples

### Server-Side Auth Check
```typescript
// In tRPC procedures
import { getServerAuthSession } from '@/server/auth-simple';

export const workflowRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      // User is guaranteed to exist due to protectedProcedure
      const userId = ctx.session.user.id;
      // ... implementation
    }),
});
```

### Client-Side Permission Checking
```typescript
// In React components
import { useAuthStore } from '@/framework/store/auth.store';

function WorkflowActions() {
  const { hasPermission, user } = useAuthStore();
  
  const canCreate = hasPermission('workflow:create');
  const canEdit = hasPermission('workflow:update');
  
  return (
    <div>
      {canCreate && <CreateButton />}
      {canEdit && <EditButton />}
    </div>
  );
}
```

## Testing Patterns

### Authentication Testing
```typescript
// Test authentication flow
import { signIn } from 'next-auth/react';

// Mock successful login
jest.mock('next-auth/react', () => ({
  signIn: jest.fn().mockResolvedValue({ ok: true, error: null }),
}));

// Test permission components
import { render } from '@testing-library/react';
import { WithPermission } from '@/components/auth/WithPermission';

test('renders content when user has permission', () => {
  // Mock auth store with required permission
  // Render component and assert visibility
});
```

## Configuration

### Environment Variables Required
```bash
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...
```

### NextAuth Configuration
- **Provider:** Credentials (email/password)
- **Session Strategy:** JWT
- **Session Duration:** 24 hours
- **Cookie Settings:** Secure, HttpOnly, SameSite

## Migration Guide

### From Legacy Auth Systems
1. **Database Migration:** Run RBAC schema migrations
2. **Environment Setup:** Configure NextAuth environment variables
3. **Component Updates:** Replace old auth components with new patterns
4. **Route Protection:** Add AuthGuard to protected pages
5. **Permission Migration:** Map old permissions to new slug format

## Changelog

### v1.0.0 - Initial Implementation
- ✅ NextAuth.js integration with credentials provider
- ✅ JWT session management
- ✅ Zustand auth store implementation
- ✅ RBAC database schema
- ✅ Permission-based UI components
- ✅ Security headers and cookie configuration
- ⚠️ Middleware temporarily disabled (needs re-enabling)
- ⚠️ No automatic route protection (requires middleware)

### Next Version (Planned)
- 🔄 Re-enable and enhance middleware
- 🔄 Add automatic route protection
- 🔄 Implement session refresh mechanism
- 🔄 Add MFA support
- 🔄 Enhanced audit logging 