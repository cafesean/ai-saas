# ESLint Security Rules

This document describes the custom ESLint security rules implemented to prevent developers from accidentally creating unprotected API endpoints.

## Overview

Our custom ESLint plugin (`eslint-plugin-security`) includes two critical security rules that enforce authentication and authorization checks across our API surface:

1. **`security/trpc-procedure-security`** - Ensures tRPC procedures include permission checks
2. **`security/api-route-security`** - Ensures API route handlers include authentication checks

## Rules

### 1. tRPC Procedure Security (`security/trpc-procedure-security`)

**Purpose**: Prevents developers from creating tRPC procedures without proper permission checks.

**What it checks**:
- All tRPC procedures (except `publicProcedure`) must include `.use(hasPermission(...))` or `.use(withPermission(...))` calls
- Only applies to files in `server/api/routers/` directories
- Skips `publicProcedure` as it's intentionally public

**Examples**:

❌ **Incorrect** (will trigger ESLint error):
```typescript
export const modelRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      // Missing permission check!
      return await ctx.db.select().from(models);
    }),
});
```

✅ **Correct**:
```typescript
export const modelRouter = createTRPCRouter({
  getAll: protectedProcedure
    .use(hasPermission('model:read'))
    .query(async ({ ctx }) => {
      return await ctx.db.select().from(models);
    }),
});
```

✅ **Also correct** (publicProcedure is allowed):
```typescript
export const modelRouter = createTRPCRouter({
  getPublicModels: publicProcedure
    .query(async ({ ctx }) => {
      // No permission check needed for public procedures
      return await ctx.db.select().from(models).where(eq(models.isPublic, true));
    }),
});
```

### 2. API Route Security (`security/api-route-security`)

**Purpose**: Ensures all API route handlers include authentication checks.

**What it checks**:
- All HTTP method exports (`GET`, `POST`, `PUT`, `DELETE`, etc.) in `/app/api/` directories
- Must call `getServerSessionOrThrow()`, `getServerSession()`, `withApiAuth()`, or similar auth functions
- Applies to both function declarations and variable declarations

**Examples**:

❌ **Incorrect** (will trigger ESLint error):
```typescript
// src/app/api/users/route.ts
export async function GET(request: NextRequest) {
  // Missing authentication check!
  const users = await db.select().from(usersTable);
  return NextResponse.json(users);
}
```

✅ **Correct**:
```typescript
// src/app/api/users/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSessionOrThrow();
  const users = await db.select().from(usersTable);
  return NextResponse.json(users);
}
```

✅ **Also correct** (using withApiAuth wrapper):
```typescript
// src/app/api/users/route.ts
export const GET = withApiAuth(async (request: NextRequest, { user }) => {
  const users = await db.select().from(usersTable);
  return NextResponse.json(users);
});
```

## Configuration

The rules are configured in `.eslintrc.js`:

```javascript
module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  plugins: ["security"],
  rules: {
    "security/trpc-procedure-security": "error",
    "security/api-route-security": "error",
  },
};
```

## CI/CD Integration

The security rules are enforced in our CI pipeline:

- **GitHub Actions**: The `ci.yml` workflow runs `pnpm run lint` which will fail if security rules are violated
- **Pre-commit hooks**: Consider adding ESLint to pre-commit hooks to catch issues early
- **IDE Integration**: Most IDEs will show ESLint errors in real-time

## Recognized Authentication Functions

The `api-route-security` rule recognizes these authentication functions:

- `getServerSessionOrThrow()`
- `getServerSession()`
- `withApiAuth()`
- `requireAuth()`
- `checkAuth()`
- Method calls like `auth.getSession()`, `auth.requireAuth()`

## Recognized Permission Functions

The `trpc-procedure-security` rule recognizes these permission middleware:

- `hasPermission()`
- `withPermission()`

## Bypassing Rules (Not Recommended)

If you absolutely need to bypass these rules (strongly discouraged), you can use ESLint disable comments:

```typescript
// eslint-disable-next-line security/api-route-security
export async function GET(request: NextRequest) {
  // This bypasses the security check - only use for truly public endpoints
  return NextResponse.json({ status: 'ok' });
}
```

**Warning**: Bypassing security rules should be rare and requires careful review. Consider using `publicProcedure` for tRPC or implementing proper authentication instead.

## Troubleshooting

### Common Issues

1. **False positives**: If the rule doesn't recognize your authentication pattern, consider:
   - Using one of the recognized function names
   - Adding your pattern to the rule configuration
   - Using a disable comment with justification

2. **Complex authentication flows**: For complex authentication that doesn't fit the pattern:
   - Extract authentication to a recognized function name
   - Use the `withApiAuth` wrapper pattern
   - Document the security approach clearly

### Adding New Authentication Patterns

To add new authentication patterns, modify the rule files in `eslint-plugin-security/rules/`:

- `api-route-security.js`: Add function names to the `authFunctions` or `authMethods` arrays
- `trpc-procedure-security.js`: Add middleware names to the `middlewareNames` array

## Security Benefits

These rules provide several security benefits:

1. **Prevent Authentication Bypass**: Catches endpoints that accidentally skip authentication
2. **Enforce Authorization**: Ensures tRPC procedures check permissions
3. **Consistent Security**: Standardizes security patterns across the codebase
4. **Early Detection**: Catches security issues at development time, not in production
5. **Code Review Aid**: Makes security violations visible in pull requests

## Related Documentation

- [RBAC Security Implementation](./rbac-security.md)
- [API Authentication Guide](./api-authentication.md)
- [tRPC Permissions System](./trpc-permissions.md)
- [Server Actions Security](./server-actions-security.md) 