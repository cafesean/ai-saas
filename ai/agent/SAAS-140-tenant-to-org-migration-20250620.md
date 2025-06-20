# SAAS-140: Complete Tenant-to-Org Migration - Architectural Planning

**Epic:** [SAAS-140](https://jira.jetdevs.com/browse/SAAS-140)  
**Created:** 2025-06-20  
**Role:** System Architect  
**Status:** 🚀 **INITIATED** - Context Priming Complete

## Context Priming Summary

### Architecture Review Findings

Based on `@architecture.md` and codebase analysis:

1. **🔴 CRITICAL SECURITY ISSUES IDENTIFIED:**
   - Authentication middleware DISABLED in `src/middleware.ts`
   - Hardcoded `tenantId = 1` across multiple tRPC routers
   - Session management broken - org switching doesn't update permissions
   - Multi-tenant isolation not properly enforced

2. **📊 CURRENT SYSTEM STATE:**
   - **Database:** 18+ schema files with tenant references
   - **API Layer:** 20+ tRPC routers with tenant logic
   - **Frontend:** Broken org switching mechanism
   - **Session:** NextAuth not updating on org changes

3. **🏗️ ARCHITECTURE CONSTRAINTS:**
   - Must maintain data integrity during migration
   - Type-safety first approach with Drizzle ORM
   - Multi-tenant RBAC system complexity
   - 40+ UI components may need updates

### Initial Scan Results

**Database Schema Files Found:**
- `src/db/schema/tenant.ts` (135 lines) - Core tenant/user relationships
- Multiple schema files with `tenantId` foreign keys
- `userTenants` table needs renaming to `userOrgs`

**API Layer Impact:**
- 50+ occurrences of `tenantId`/`tenant_id` in TypeScript files
- Multiple routers with hardcoded tenant logic
- tRPC context missing proper org isolation

## Epic Breakdown & Task Planning

### 🎯 **Phase 1: Database Schema Migration** (Week 1)
**Epic Child:** [SAAS-141](https://jira.jetdevs.com/browse/SAAS-141)

**Priority Tasks:**
- [ ] **CRITICAL:** Create database backup and rollback plan
- [ ] **HIGH:** Update `src/db/schema/tenant.ts` → `src/db/schema/org.ts`
- [ ] **HIGH:** Rename tables: `tenants` → `orgs`, `userTenants` → `userOrgs`  
- [ ] **HIGH:** Update all foreign key references across 18+ schema files
- [ ] **MEDIUM:** Generate and test Drizzle migration scripts
- [ ] **MEDIUM:** Update schema index.ts exports

**Database Changes Required:**
```sql
-- Table renames
ALTER TABLE tenants RENAME TO orgs;
ALTER TABLE user_tenants RENAME TO user_orgs;

-- Column renames across ALL tables
ALTER TABLE orgs RENAME COLUMN tenant_id TO org_id;
ALTER TABLE user_orgs RENAME COLUMN tenant_id TO org_id;
ALTER TABLE user_roles RENAME COLUMN tenant_id TO org_id;
ALTER TABLE models RENAME COLUMN tenant_id TO org_id;
-- ... continue for all 18+ schema files
```

### 🔧 **Phase 2: API Layer Migration** (Week 2)
**Epic Child:** [SAAS-142](https://jira.jetdevs.com/browse/SAAS-142)

**Priority Tasks:**
- [ ] **CRITICAL:** Remove hardcoded `tenantId = 1` from ALL routers
- [ ] **CRITICAL:** Update tRPC context to include proper org isolation
- [ ] **HIGH:** Update 20+ router files to use `orgId` terminology
- [ ] **HIGH:** Fix permission checking logic across all procedures
- [ ] **MEDIUM:** Update all Zod input/output schemas
- [ ] **LOW:** Rename `tenant.router.ts` → `org.router.ts`

**Files Requiring Updates:**
- `src/server/api/trpc.ts` - Context creation
- `src/server/api/routers/*.ts` - All 20+ router files
- `src/lib/trpc-permissions.ts` - Permission checking
- `src/lib/api-auth.ts` - Authentication helpers

### 🔐 **Phase 3: Session Management Fix** (Week 3)
**CRITICAL:** This addresses the broken org switching issue

**Priority Tasks:**
- [ ] **CRITICAL:** Enable authentication middleware in `src/middleware.ts`
- [ ] **CRITICAL:** Fix NextAuth session to include current org context
- [ ] **HIGH:** Update `src/server/auth.ts` JWT/session callbacks
- [ ] **HIGH:** Fix org switching API endpoint
- [ ] **HIGH:** Update frontend auth store for proper session sync
- [ ] **MEDIUM:** Implement permission cache invalidation

**Session Management Changes:**
```typescript
// NextAuth session update
callbacks: {
  session: async ({ session, token }) => ({
    ...session,
    user: { 
      ...session.user, 
      currentOrgId: token.currentOrgId 
    }
  }),
  jwt: async ({ token, trigger, session }) => {
    if (trigger === "update" && session?.orgId) {
      token.currentOrgId = session.orgId;
    }
    return token;
  }
}
```

### 🎨 **Phase 4: Frontend Integration** (Week 4)

**Priority Tasks:**
- [ ] **HIGH:** Update org switcher component behavior
- [ ] **HIGH:** Fix permission-based UI rendering
- [ ] **MEDIUM:** Update all components using tenant terminology
- [ ] **MEDIUM:** Update API call patterns to use orgId
- [ ] **LOW:** Update UI text/labels from "tenant" to "org"

## Risk Assessment & Mitigation

### 🚨 **CRITICAL RISKS**

1. **Data Loss During Migration**
   - **Mitigation:** Full database backup + tested rollback scripts
   - **Validation:** Multiple test runs in development environment

2. **Session Security Vulnerabilities**  
   - **Mitigation:** Enable middleware immediately after testing
   - **Validation:** Comprehensive security testing of org switching

3. **Multi-Tenant Data Leakage**
   - **Mitigation:** Strict org isolation validation at every API endpoint
   - **Validation:** Audit all router procedures for proper org filtering

### ⚠️ **MEDIUM RISKS**

1. **TypeScript Compilation Errors**
   - **Mitigation:** Incremental updates with type checking at each step
   - **Validation:** Continuous integration checks

2. **Frontend State Management Issues**
   - **Mitigation:** Comprehensive testing of org switching flow
   - **Validation:** E2E tests for all org switching scenarios

## Success Metrics

### 🎯 **Completion Criteria**
- [ ] Zero data loss during migration
- [ ] Org switching works in <2 seconds
- [ ] No hardcoded tenant IDs remain in codebase
- [ ] All 20+ routers use proper org context
- [ ] Authentication middleware enabled and working
- [ ] Session updates immediately on org switch
- [ ] All UI components use "org" terminology
- [ ] Comprehensive test coverage

### 📊 **Quality Gates**
- [ ] Database migration passes all integrity checks
- [ ] All TypeScript compilation errors resolved
- [ ] No console errors during org switching
- [ ] Performance regression tests pass
- [ ] Security audit passes (no data leakage)

## Architecture Decisions Made

### 🏗️ **Design Decisions**

1. **Database Strategy:** Rename tables AND columns for complete consistency
2. **User-Org Relationships:** **JSONB approach** for better performance and flexibility
   - Single query to get user + all org memberships
   - Atomic updates for org switching
   - Flexible schema for future metadata
   - Better caching capabilities
3. **Migration Strategy:** Phased approach to minimize risk
4. **Session Strategy:** Leverage NextAuth JWT update mechanism  
5. **API Strategy:** Update tRPC context to include org isolation
6. **Frontend Strategy:** Maintain existing component structure, update terminology

### 🔄 **Integration with Existing Work**

**SAAS-138 (Permission Naming):** 
- ✅ Already started tenant → org permission naming
- 🔄 Will integrate org terminology across all permissions
- 📋 Ensures consistent naming convention

## Next Steps

### 🚀 **Immediate Actions** (Today)
1. Update Jira tickets to "In Progress"
2. Create database backup strategy
3. Begin Phase 1: Database schema analysis and migration planning
4. Start with `src/db/schema/tenant.ts` → `src/db/schema/org.ts`

### 📅 **This Week Priority**
1. Complete database schema migration plan
2. Test migration scripts in development
3. Begin API layer analysis for hardcoded tenantId removal

---

## Progress Log

### 2025-06-20 - Project Initiation
- [X] **Context Priming Complete** - Architecture review done
- [X] **Epic Created** - SAAS-140 with comprehensive scope  
- [X] **Child Stories Created** - SAAS-141 (DB), SAAS-142 (Session)
- [X] **Initial Scan Complete** - 50+ tenantId occurrences identified
- [X] **Role Transition** - Switched to Tech Lead for implementation
- [X] **Jira Updates** - Moved SAAS-140 and SAAS-141 to "Open" status

### Status: 🚀 **PHASE 1 IN PROGRESS**

### 2025-06-20 - Phase 1: Database Schema Migration Started
- [X] **New org.ts Schema Created** - Complete replacement for tenant.ts
  - ✅ Renamed `tenants` → `orgs` 
  - ✅ **ARCHITECTURAL IMPROVEMENT**: Moved user-org relationships to JSONB in users table
  - ✅ Added `orgData` JSONB field with GIN index for efficient queries
  - ✅ Marked `userOrgs` table as legacy (to be deprecated)
  - ✅ Added backward compatibility exports
- [X] **TypeScript Types Created** - `src/types/org.ts` for JSONB structure
  - ✅ `UserOrgData` and `UserOrgRelationship` interfaces
  - ✅ Helper types for org switching and queries
  - ✅ Role constants and validation schemas
- [X] **RBAC Schema Updated** - Updated to use org terminology
  - ✅ Import statements updated to use `org.ts`
  - ✅ Updated `tenantId` → `orgId` in userRoles table
  - ✅ Updated indexes and constraints
  - ✅ Updated relations to reference `orgs`
- [X] **All Schema Files Updated** - 10/10 completed ✅
  - ✅ `audit.ts`, `decision_table.ts`, `knowledge_base.ts`, `model.ts`
  - ✅ `workflow.ts`, `variable.ts`, `test_scenario.ts`, `rule_set.ts`
  - ✅ `lookup_table.ts` (complex N-dimensional table system)
  - ✅ `rule.ts` (business rules engine)
- [X] **Schema Index Updated** - ✅ `src/db/schema/index.ts`
  - ✅ Updated imports to use new `org.ts` schema
  - ✅ Updated exports with new org terminology
  - ✅ Maintained backward compatibility exports
- [ ] **Generate migration script** - Create Drizzle migration
- [ ] **Test migration** - Validate in development environment

---

## Lessons Learned

### From Architecture Review:
1. **Security-First Approach:** Critical middleware disabled - must fix immediately
2. **Type Safety:** Drizzle ORM provides good migration tools but requires careful planning
3. **Multi-Tenant Complexity:** RBAC system adds significant complexity to migration
4. **Session Management:** NextAuth JWT strategy needs proper org context handling

### Migration Planning:
1. **Phased Approach:** Essential for system this complex
2. **Backup Strategy:** Critical given data sensitivity  
3. **Testing Strategy:** Each phase needs comprehensive validation
4. **Risk Mitigation:** Multiple security and data integrity checkpoints required

</rewritten_file> 