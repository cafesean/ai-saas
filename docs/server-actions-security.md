# Server Actions Security Guide

## Overview

This guide covers the security implementation for Next.js Server Actions in our application. Server Actions provide a secure way to handle server-side mutations directly from React components.

## Security Features

### 1. Allowed Origins Configuration

Server Actions are configured with strict origin validation in `next.config.mjs`:

```javascript
serverActions: {
  bodySizeLimit: '2mb',
  allowedOrigins: [
    // Development origins (only in development)
    'localhost:3000', 'localhost:3001', '127.0.0.1:3000', '127.0.0.1:3001',
    // Environment-specific origins
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_CDN_BASE_URL,
    process.env.NEXTAUTH_URL,
    // Production domains via ALLOWED_ORIGINS env var
  ]
}
```

### 2. Secure Wrapper Functions

All Server Actions should use our secure wrapper functions from `src/lib/server-actions.ts`:

#### `withServerActionAuth()` - For Protected Actions

```typescript
"use server";

import { withServerActionAuth } from '@/lib/server-actions';

export const createWorkflow = withServerActionAuth(
  async (ctx, data: { name: string; description?: string }) => {
    // ctx.user - authenticated user
    // ctx.tenantId - user's tenant
    // ctx.session - full session object
    
    return await db.insert(workflows).values({
      ...data,
      tenantId: ctx.tenantId,
      createdBy: ctx.user.id,
    });
  },
  { requiredPermission: 'workflow:create' }
);
```

#### `withPublicServerAction()` - For Public Actions

```typescript
"use server";

import { withPublicServerAction } from '@/lib/server-actions';

export const subscribeToNewsletter = withPublicServerAction(
  async (email: string) => {
    // Public action logic
    return await addToNewsletter(email);
  }
);
```

### 3. Security Features

#### Authentication & Authorization
- **Session Validation**: Verifies user authentication
- **Permission Checks**: Validates user permissions using RBAC
- **Tenant Isolation**: Ensures multi-tenant data isolation

#### Audit Logging
- **Permission Denials**: Logs failed permission checks
- **Unauthorized Access**: Logs authentication failures
- **Error Tracking**: Comprehensive error logging

#### Input Validation
- **Zod Integration**: Type-safe input validation
- **Schema Validation**: Structured data validation

```typescript
import { z } from 'zod';
import { validateServerActionInput } from '@/lib/server-actions';

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const createWorkflow = withServerActionAuth(
  async (ctx, rawData: unknown) => {
    const data = validateServerActionInput(createWorkflowSchema, rawData);
    // ... rest of action
  },
  { requiredPermission: 'workflow:create' }
);
```

## Environment Configuration

### Required Environment Variables

```bash
# Base URLs for origin validation
NEXT_PUBLIC_BASE_URL=https://your-app.com
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.your-app.com
NEXTAUTH_URL=https://your-app.com

# Production domains (comma-separated)
ALLOWED_ORIGINS=https://app.your-domain.com,https://admin.your-domain.com
```

### Development vs Production

- **Development**: Allows localhost origins automatically
- **Production**: Only allows explicitly configured origins
- **Environment-aware**: Different configurations per environment

## Best Practices

### 1. Always Use Wrappers
```typescript
// ✅ Good - Using secure wrapper
export const createItem = withServerActionAuth(async (ctx, data) => {
  // Secure action logic
}, { requiredPermission: 'item:create' });

// ❌ Bad - Raw server action
export async function createItem(data: any) {
  "use server";
  // No security checks
}
```

### 2. Validate All Inputs
```typescript
// ✅ Good - Input validation
const schema = z.object({ name: z.string().min(1) });
export const createItem = withServerActionAuth(async (ctx, rawData) => {
  const data = validateServerActionInput(schema, rawData);
  // ... rest of action
});

// ❌ Bad - No validation
export const createItem = withServerActionAuth(async (ctx, data: any) => {
  // Direct use of unvalidated data
});
```

### 3. Use Appropriate Permissions
```typescript
// ✅ Good - Specific permission
{ requiredPermission: 'workflow:create' }

// ❌ Bad - Overly broad permission
{ requiredPermission: 'admin:full_access' }
```

### 4. Handle Errors Gracefully
```typescript
export const createItem = withServerActionAuth(async (ctx, data) => {
  try {
    return await db.insert(items).values(data);
  } catch (error) {
    // Error is automatically logged by wrapper
    throw new Error('Failed to create item');
  }
});
```

## Security Checklist

- [ ] Server Action uses secure wrapper function
- [ ] Appropriate permission specified
- [ ] Input validation implemented
- [ ] Error handling in place
- [ ] Tenant isolation enforced
- [ ] Audit logging configured
- [ ] Origin restrictions configured

## Common Patterns

### CRUD Operations
```typescript
// Create
export const createWorkflow = withServerActionAuth(async (ctx, data) => {
  return await db.insert(workflows).values({ ...data, tenantId: ctx.tenantId });
}, { requiredPermission: 'workflow:create' });

// Read (if needed as server action)
export const getWorkflow = withServerActionAuth(async (ctx, id: number) => {
  return await db.query.workflows.findFirst({
    where: and(eq(workflows.id, id), eq(workflows.tenantId, ctx.tenantId))
  });
}, { requiredPermission: 'workflow:read' });

// Update
export const updateWorkflow = withServerActionAuth(async (ctx, id: number, data) => {
  return await db.update(workflows)
    .set(data)
    .where(and(eq(workflows.id, id), eq(workflows.tenantId, ctx.tenantId)));
}, { requiredPermission: 'workflow:update' });

// Delete
export const deleteWorkflow = withServerActionAuth(async (ctx, id: number) => {
  return await db.delete(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.tenantId, ctx.tenantId)));
}, { requiredPermission: 'workflow:delete' });
```

### File Upload Actions
```typescript
export const uploadFile = withServerActionAuth(async (ctx, formData: FormData) => {
  const file = formData.get('file') as File;
  
  // Validate file
  if (!file || file.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('Invalid file or file too large');
  }
  
  // Process upload
  const result = await processFileUpload(file, ctx.tenantId);
  return result;
}, { requiredPermission: 'file:upload' });
```

## Troubleshooting

### Common Issues

1. **Origin Rejected**: Check `allowedOrigins` configuration
2. **Permission Denied**: Verify user has required permission
3. **Session Invalid**: Ensure user is authenticated
4. **Tenant Missing**: Check user-tenant association

### Debug Logging

Server Action errors are automatically logged with context:
- Action name
- User ID and tenant ID
- Error message and stack trace
- Timestamp and request details 