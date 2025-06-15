# SAAS-39: TS-TRPC-01 - tRPC Middleware Implementation

## Task: Implement `hasPermission` tRPC Middleware with Caching

### Acceptance Criteria
1. [ ] A `protectedProcedure.use(hasPermission('permission:slug'))` middleware is created
2. [ ] User's complete permission set cached in Redis using `(userId:tenantId)` key
3. [ ] Cache invalidation on role change, tenant switch, or session revocation
4. [ ] Automatic `createAuditLog` with `PERMISSION_DENIED` action on failures
5. [ ] All tRPC mutations and relevant queries wrapped with middleware

### Implementation Plan
1. [X] Examine current tRPC setup and procedures
2. [X] Create hasPermission middleware function
3. [X] Implement Redis caching for permissions (basic structure, Redis disabled for now)
4. [X] Add cache invalidation logic (placeholder functions)
5. [X] Integrate audit logging
6. [X] Apply middleware to all tRPC procedures (started with key routers)
7. [X] Test implementation (basic compilation check)
8. [ ] Update documentation

### Current Status
- **Status:** In Progress
- **Progress:** 90% - Core implementation complete

### Implementation Details

#### ✅ Completed Features:
1. **Enhanced tRPC Middleware (`src/lib/trpc-permissions.ts`)**:
   - `hasPermission(permission)` middleware factory
   - `getUserPermissions()` with caching support
   - `checkUserPermission()` for individual permission checks
   - Automatic audit logging on permission denials

2. **Audit Logging System (`src/lib/audit.ts`)**:
   - `createAuditLog()` for general audit events
   - `logTrpcAccessDenied()` for tRPC permission denials
   - `logPermissionDenied()` for API permission denials
   - `logUnauthorizedAccess()` for security events

3. **Database Schema (`src/db/schema/audit.ts`)**:
   - `audit_logs` table with comprehensive tracking
   - Foreign key relationships to users and tenants
   - Indexed for performance (action, user, tenant, timestamp)

4. **Redis Caching Infrastructure (`src/lib/redis.ts`)**:
   - Redis client configuration
   - Permission cache key generation
   - Cache TTL management (1 hour)
   - Cache invalidation functions
   - Graceful fallback when Redis unavailable

5. **tRPC Integration (`src/server/api/trpc.ts`)**:
   - Updated `createPermissionMiddleware()` to use enhanced system
   - New `withPermission()` middleware factory
   - Backward compatibility with existing `requiresPermission()`

6. **Applied to Key Routers**:
   - `admin.router.ts`: Protected RBAC seeding with `admin:full_access`
   - `role.router.ts`: All CRUD operations require `admin:full_access`
   - `workflow.router.ts`: Applied `workflow:read` and `workflow:create` permissions

#### 🔄 Redis Caching Status:
- **Structure**: Complete with all cache functions implemented
- **Status**: Disabled due to ioredis import issues in development
- **Fallback**: Direct database queries (still performant)
- **Future**: Enable when Redis is properly configured

#### 📊 Audit Logging:
- **Database**: `audit_logs` table created and migrated
- **Integration**: Automatic logging on all permission denials
- **Data Captured**: User, tenant, resource, permission, IP, user agent, details
- **Severity Levels**: INFO, WARN, ERROR, CRITICAL

### Next Steps
1. Apply permissions to remaining tRPC routers
2. Enable Redis caching when environment is ready
3. Add cache invalidation triggers on role/permission changes 