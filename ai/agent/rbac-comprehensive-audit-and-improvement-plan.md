# RBAC Comprehensive Audit & Improvement Plan

**Role:** Architect  
**Task:** Comprehensive RBAC System Audit and Improvement Plan  
**Created:** January 19, 2025  
**Epic:** Security Architecture & RBAC Enhancement

---

## Executive Summary

After conducting a comprehensive audit of the current RBAC (Role-Based Access Control) implementation, I've identified **critical security vulnerabilities**, **architectural inconsistencies**, and **maintenance issues** that require immediate attention. This document provides a complete assessment and structured improvement plan.

---

## 🔍 Current State Analysis

### ✅ **Strengths Identified**

1. **Solid Database Foundation**
   - Well-structured RBAC schema (`roles`, `permissions`, `rolePermissions`, `userRoles`)
   - Proper multi-tenant architecture with `tenantId` fields
   - Comprehensive permission catalog in `src/constants/permissions.ts`
   - Good use of composite keys and proper indexing

2. **Comprehensive Permission System**
   - 726 lines of well-organized permissions with consistent naming (`module:action`)
   - Proper categorization (workflow, model, decision_table, etc.)
   - Role-based permission groupings (Admin, Analyst, Developer, Viewer)

3. **UI Permission Gating**
   - Robust `WithPermission` component with multiple access patterns
   - Well-tested component with comprehensive test coverage
   - Support for multiple permission types (single, multiple, any, role-based)

### 🚨 **Critical Security Issues**

#### **CRITICAL: Authentication Middleware Disabled**
```typescript
// src/middleware.ts - Lines 87-89
export const config = {
  matcher: [], // ⚠️ COMPLETELY DISABLED!
};
```
**Impact:** No authentication protection on routes, complete security bypass possible

#### **CRITICAL: Hardcoded Tenant IDs**
Found multiple instances across routers:
- `tenant.router.ts`: Missing tenant validation in several procedures
- Multiple routers using `getUserTenantId()` but not consistently
- Some procedures completely bypass tenant checks

#### **CRITICAL: Inconsistent Permission Enforcement**
```typescript
// Current inconsistent patterns:
- Some procedures use `protectedProcedure` (auth only)
- Others use `withPermission(permission)` (proper RBAC)
- Many use no protection at all
- Admin procedures use legacy role checking instead of permissions
```

### 🔧 **Architectural Issues**

#### **Issue 1: Multiple Permission Checking Patterns**
- **Legacy Pattern:** `ctx.session.user.roles?.flatMap(role => role.policies?.map(policy => policy.name)`
- **New Pattern:** `getUserPermissions(userId, tenantId)` from `lib/trpc-permissions.ts`
- **Inconsistent Usage:** Different routers use different patterns

#### **Issue 2: Context Structure Mismatch**
```typescript
// Current tRPC context issues:
- Some code expects `ctx.user` but context has `ctx.session.user`
- Tenant context not consistently available
- Permission caching implementation incomplete
```

#### **Issue 3: Database Access Layer Issues**
- Multiple database configuration files (`src/db/config.ts` vs `src/db/db.ts`)
- Inconsistent import patterns
- Row-Level Security (RLS) not enabled on tenant tables

---

## 🎯 **Detailed Findings by Category**

### **Authentication & Authorization**

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Middleware Disabled | 🔴 CRITICAL | `src/middleware.ts` | Authentication bypass possible |
| Hardcoded Tenant IDs | 🔴 CRITICAL | Multiple routers | Security isolation broken |
| Inconsistent Permission Checks | 🟡 HIGH | All routers | Some endpoints unprotected |
| Legacy Role Checking | 🟡 MEDIUM | `adminProcedure` | Using role names vs permissions |

### **tRPC Router Analysis**

| Router | Protection Level | Issues Found |
|--------|------------------|--------------|
| `admin.router.ts` | ❌ Mixed | Uses legacy role checking, some procedures unprotected |
| `tenant.router.ts` | ⚠️ Partial | Some procedures lack permission checks |
| `workflow-core.router.ts` | ✅ Good | Uses `protectedProcedure` consistently |
| `lookupTable.router.ts` | ❌ Poor | Hardcoded `tenantId: 1` found |

### **UI Component Status**

| Component | Status | Issues |
|-----------|--------|--------|
| `WithPermission` | ✅ Excellent | Well-implemented, tested |
| `AuthGuard` | ✅ Good | Functional auth protection |
| `AuthProvider` | ⚠️ Needs Update | State sync issues with new RBAC |

---

## 📋 **Improvement Plan**

### **Phase 1: Critical Security Fixes** (Week 1)

#### **Task 1.1: Re-enable Authentication Middleware**
```typescript
// Fix src/middleware.ts
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

#### **Task 1.2: Fix Hardcoded Tenant IDs**
- [ ] Audit all routers for hardcoded `tenantId: 1`
- [ ] Implement consistent `getUserTenantId()` usage
- [ ] Add tenant validation to all procedures

#### **Task 1.3: Standardize Permission Enforcement**
```typescript
// Create standardized procedures
export const adminProcedure = protectedProcedure.use(hasPermission('admin:full_access'));
export const createWorkflowProcedure = protectedProcedure.use(hasPermission('workflow:create'));
```

### **Phase 2: Architectural Consistency** (Week 2)

#### **Task 2.1: Consolidate Permission Checking**
- [ ] Remove legacy role-based checking
- [ ] Standardize on permission-based checks
- [ ] Implement permission caching strategy

#### **Task 2.2: Fix Context Structure**
```typescript
// Standardize tRPC context
export const createTRPCContext = async (opts?: { headers: Headers }) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const tenantId = user ? await getUserTenantId(user.id) : null;
  
  return {
    db,
    session,
    user,
    tenantId, // Always available for authenticated users
    ...opts,
  };
};
```

#### **Task 2.3: Enable Row-Level Security**
```sql
-- Enable RLS on all tenant tables
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
-- ... for all tenant tables

-- Create policies
CREATE POLICY tenant_isolation_policy ON workflows
  FOR ALL TO authenticated_users
  USING (tenant_id = current_setting('app.tenant_id')::int);
```

### **Phase 3: Enhanced Security Features** (Week 3)

#### **Task 3.1: Implement Audit Logging**
- [ ] Create audit log table and procedures
- [ ] Log all permission denials
- [ ] Track sensitive operations

#### **Task 3.2: Add Rate Limiting**
- [ ] Enable Redis-based rate limiting
- [ ] Apply to authentication endpoints
- [ ] Add to sensitive mutations

#### **Task 3.3: Security Headers Enhancement**
- [ ] Strengthen CSP policies
- [ ] Add security monitoring
- [ ] Implement session revocation

### **Phase 4: Testing & Validation** (Week 4)

#### **Task 4.1: Comprehensive Testing**
- [ ] Unit tests for all permission checks
- [ ] Integration tests for tenant isolation
- [ ] E2E tests for negative authorization paths

#### **Task 4.2: Security Validation**
- [ ] Penetration testing for auth bypass
- [ ] Tenant isolation verification
- [ ] Permission escalation testing

---

## 🏗️ **Implementation Strategy**

### **Priority Matrix**

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Re-enable Middleware | HIGH | LOW | 🔴 P1 |
| Fix Hardcoded Tenants | HIGH | MEDIUM | 🔴 P1 |
| Standardize Permissions | HIGH | HIGH | 🟡 P2 |
| Enable RLS | MEDIUM | MEDIUM | 🟡 P2 |
| Implement Auditing | MEDIUM | HIGH | 🟢 P3 |

### **Development Approach**

1. **Security-First:** Address critical vulnerabilities immediately
2. **Incremental:** Make changes without breaking existing functionality
3. **Test-Driven:** Validate each change with comprehensive tests
4. **Documentation:** Update architecture docs as we go

### **Risk Mitigation**

- **Backward Compatibility:** Maintain existing API contracts during transition
- **Feature Flags:** Use feature flags for gradual rollout
- **Monitoring:** Add extensive logging during transition
- **Rollback Plan:** Ensure ability to quickly revert changes

---

## 📊 **Success Metrics**

### **Security Metrics**
- [ ] 0 authentication bypasses possible
- [ ] 100% of endpoints have proper authorization
- [ ] 0 cross-tenant data leaks
- [ ] All permission denials logged

### **Code Quality Metrics**
- [ ] Single permission checking pattern across codebase
- [ ] 95%+ test coverage on auth/authz code
- [ ] All ESLint security rules passing
- [ ] Zero hardcoded security values

### **Performance Metrics**
- [ ] Permission checks < 10ms average
- [ ] Database queries optimized with proper indexing
- [ ] Redis caching functioning correctly

---

## 🎯 **Next Steps**

### **Immediate Actions (Today)**
1. Create Jira epic and stories for this work
2. Set up feature branch for security fixes
3. Begin Phase 1: Critical Security Fixes

### **Short Term (This Week)**
1. Re-enable middleware with proper configuration
2. Audit and fix all hardcoded tenant IDs
3. Create standardized permission procedures

### **Medium Term (Next 2 Weeks)**
1. Implement comprehensive testing strategy
2. Enable Row-Level Security
3. Add audit logging and monitoring

---

## 📚 **References**

- [EPIC-RBAC v4.md](../requirements/EPIC-RBAC%20v4.md) - Original implementation plan
- [Architecture.md](../arch/architecture.md) - Current system architecture
- [RBAC Lessons Learned](../lessons/) - Previous implementation issues
- [Security Best Practices](https://owasp.org/www-project-top-ten/) - OWASP guidelines

---

**Status:** 🔄 **AUDIT COMPLETE - READY FOR IMPLEMENTATION**  
**Assigned:** Architecture Team  
**Review Required:** Security Team, Technical Leadership 