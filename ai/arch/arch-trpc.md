# tRPC Architecture Standards

**Jira Task:** [SAAS-112: tRPC Architecture](https://jira.jetdevs.com/browse/SAAS-112)  
**Epic:** [SAAS-111: Architecture Documentation](https://jira.jetdevs.com/browse/SAAS-111)

## Overview & Purpose

This document defines the current tRPC implementation patterns in the AI SaaS platform and provides guidance for consistent API development. Based on a comprehensive review of the existing codebase, this serves as both documentation of current practices and standards for future development.

## Where to Find Logic

### Core tRPC Configuration
- **Main tRPC setup:** `src/server/api/trpc.ts` - Context creation, procedures, middleware
- **Root router:** `src/server/api/root.ts` - Combines all routers
- **Router implementations:** `src/server/api/routers/*.ts` - Individual domain routers

### Key Files
- `src/server/api/trpc.ts` - tRPC context, procedures, and middleware definitions
- `src/server/api/root.ts` - Main app router that aggregates all domain routers
- `src/server/api/routers/` - Contains 20+ router files organized by domain
- `src/trpc/server.ts` - Server-side caller setup
- `src/utils/trpc.ts` - Client-side tRPC utilities

### Router Organization (Current State)
The platform currently has these routers in production:
```
├── admin.router.ts          - Admin operations, RBAC seeding
├── auth.router.ts           - User registration 
├── dashboard.router.ts      - Dashboard data
├── decisionTable.router.ts  - Decision tables
├── knowledge-bases.router.ts - Knowledge base management
├── lookup-table.router.ts   - Lookup tables (legacy)
├── new-lookup-table.ts      - New lookup table implementation
├── lookupTable.router.ts    - Lookup table operations
├── model.router.ts          - AI model management
├── n8n.ts                   - N8N workflow integration
├── permission.router.ts     - Permission management
├── role.router.ts           - Role management
├── rule.router.ts           - Business rules
├── rule-set.router.ts       - Rule sets
├── template.router.ts       - Templates
├── tenant.router.ts         - Multi-tenant operations
├── twilio.router.ts         - Twilio integration
├── user.router.ts           - User management
├── variable.router.ts       - Variable management
├── widget.router.ts         - Widget operations
└── workflow.router.ts       - Workflow management (largest: 1047 lines)
```

## Current Patterns & Best Practices

### 1. Procedure Types & Authentication

The platform implements a sophisticated authentication system with multiple procedure types:

```typescript
// From src/server/api/trpc.ts
export const publicProcedure = t.procedure;           // No auth required
export const protectedProcedure = t.procedure;       // Requires authentication  
export const adminProcedure = protectedProcedure;    // Requires admin permissions
export const withPermission = (perm: string) => { }; // Permission-based access
```

**Template Usage:**
```typescript
// Standard pattern from user.router.ts
export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(userFiltersSchema)
    .query(async ({ ctx, input }) => {
      // Implementation
    }),
    
  create: protectedProcedure
    .input(userSchema)
    .mutation(async ({ ctx, input }) => {
      // Implementation with error handling
    }),
});
```

### 2. Input Validation with Zod

**✅ Current Standard Pattern:**
```typescript
// From multiple routers - consistent Zod usage
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  isActive: z.boolean().default(true),
});

const userFiltersSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});
```

### 3. Error Handling Patterns

**✅ Standard Error Pattern (Template):**
```typescript
// From tenant.router.ts - Good example
try {
  const [updatedTenant] = await db.update(tenants)
    .set(updateData)
    .where(eq(tenants.id, id))
    .returning();
  return updatedTenant;
} catch (error) {
  console.error("Error updating tenant:", error);
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Failed to update tenant',
    cause: error,
  });
}
```

**✅ Business Logic Error Handling:**
```typescript
// From user.router.ts - Domain-specific validation
if (existingUser[0]) {
  throw new TRPCError({
    code: 'CONFLICT',
    message: 'A user with this email already exists'
  });
}
```

### 4. Database Access Patterns

**✅ Standard Query Pattern:**
```typescript
// Using Drizzle ORM with proper error handling
const users = await db.select()
  .from(users)
  .where(and(
    eq(users.tenantId, tenantId),
    like(users.name, `%${search}%`)
  ))
  .limit(input.limit)
  .offset(input.offset);
```

### 5. Rate Limiting (Admin Operations)

**✅ Rate Limiting Pattern:**
```typescript
// From admin.router.ts
try {
  const { checkTRPCRateLimit } = await import("@/lib/rate-limit");
  await checkTRPCRateLimit(ctx.session?.user?.id, "admin.seedRBAC");
} catch (error) {
  if (error instanceof Error && error.message.includes("Rate limit exceeded")) {
    throw error;
  }
}
```

## Templates/Model Components

### 🎯 Best Implementation Examples

1. **`src/server/api/routers/user.router.ts`** - Excellent example of:
   - Comprehensive CRUD operations
   - Proper error handling
   - Input validation
   - Business logic checks

2. **`src/server/api/routers/tenant.router.ts`** - Good patterns for:
   - Multi-tenant operations
   - Soft delete implementation
   - Complex filtering

3. **`src/server/api/routers/auth.router.ts`** - Simple, focused router
   - Single responsibility
   - Clean error handling

4. **`src/server/api/trpc.ts`** - Middleware and procedure setup
   - Authentication middleware
   - Permission-based procedures
   - Context creation

### 🚀 Copy These Patterns

**Router Structure Template:**
```typescript
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from '@trpc/server';

const entitySchema = z.object({
  // Define schema
});

export const entityRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(filtersSchema.optional())
    .query(async ({ ctx, input }) => {
      // Implementation
    }),
    
  create: protectedProcedure
    .input(entitySchema)
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),
});
```

## Anti-Patterns & Common Mistakes

### ❌ Issues Found in Current Codebase

1. **Hardcoded Tenant IDs**
   ```typescript
   // Found in multiple routers - SHOULD BE FIXED
   const tenantId = 1; // TODO: Implement proper tenant lookup
   ```
   **Location:** `rule-set.router.ts`, `lookup-table.router.ts`, `variable.router.ts`

2. **Inconsistent Error Handling**
   ```typescript
   // Bad: Generic error without context
   throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
   
   // Good: Specific error with context
   throw new TRPCError({
     code: "NOT_FOUND",
     message: "User not found",
   });
   ```

3. **Router Naming Inconsistency**
   - ❌ Mix of `.router.ts` and `.ts` suffixes
   - ❌ `lookupTable.router.ts` vs `lookup-table.router.ts` vs `new-lookup-table.ts`

4. **Overly Large Routers**
   - ❌ `workflow.router.ts` (1047 lines) - Should be split into smaller, focused routers
   - ❌ `lookup-table.router.ts` (822 lines) - Too many responsibilities

5. **Missing Input Validation**
   ```typescript
   // Found in some routers - missing comprehensive validation
   .input(z.string()) // Too generic
   
   // Better:
   .input(z.string().uuid("Invalid UUID format"))
   ```

6. **Inconsistent Permission Checks**
   - Some routers use `protectedProcedure`, others use `withPermission()`
   - No clear pattern for when to use which

### 🚨 Security Issues Found

1. **Missing Rate Limiting** - Only admin operations have rate limiting
2. **Insufficient Input Sanitization** - Some routers lack comprehensive validation
3. **Hardcoded Tenant Access** - Multi-tenancy not properly enforced

## Known Issues & Refactoring Needs

### High Priority Issues

1. **Multi-tenancy Implementation** 
   - **Problem:** Hardcoded `tenantId = 1` throughout codebase
   - **Impact:** Security risk, multi-tenant isolation broken
   - **Files Affected:** `rule-set.router.ts`, `lookup-table.router.ts`, `variable.router.ts`, others
   - **Solution:** Implement proper tenant context extraction

2. **Workflow Router Size**
   - **Problem:** Single router with 1047 lines
   - **Impact:** Maintainability, code organization
   - **Solution:** Split into sub-routers by functionality

3. **Lookup Table Duplication**
   - **Problem:** Three different lookup table implementations
   - **Files:** `lookup-table.router.ts`, `lookupTable.router.ts`, `new-lookup-table.ts`
   - **Solution:** Consolidate into single implementation

### Medium Priority Issues

1. **Inconsistent File Naming**
2. **Missing Comprehensive Error Types**
3. **Rate Limiting Coverage**

## Recommendations for Future Development

### 1. Router Organization
- Use `.router.ts` suffix consistently
- Keep routers under 300 lines
- One router per domain/entity
- Use sub-routers for complex entities (see `lookup-table.router.ts` rows sub-router)

### 2. Security
- Implement proper tenant context extraction
- Add rate limiting to all mutation operations
- Use `withPermission()` for granular access control

### 3. Error Handling
- Always include specific error messages
- Use appropriate HTTP status codes
- Log errors with context for debugging

### 4. Validation
- Use comprehensive Zod schemas
- Validate UUIDs with proper format checking
- Include business rule validation

## Changelog

### v1.0 - 2024-01-09 (Initial Review)
- Reviewed 20+ router implementations
- Documented current patterns and anti-patterns
- Identified 6 major refactoring needs
- Created template patterns for new routers
- Found multi-tenancy security issues requiring immediate attention

### Issues Logged
- SAAS-TBD: Fix hardcoded tenant IDs across all routers
- SAAS-TBD: Refactor workflow.router.ts (1047 lines)
- SAAS-TBD: Consolidate lookup table implementations
- SAAS-TBD: Implement consistent file naming convention 