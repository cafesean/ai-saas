# Lessons Learned: RBAC Implementation Issues

## **📋 Summary**
During RBAC implementation, multiple breaking changes were introduced that caused previously working features (knowledge bases, decision tables, etc.) to fail. Here are the key issues and solutions:

---

## **🔧 Technical Issues Found**

### **1. tRPC API Changes (TanStack Query v5)**
- **Problem**: `isLoading` property no longer exists in mutation hooks
- **Error**: `Property 'isLoading' does not exist on type 'UseTRPCMutationResult'`
- **Solution**: Replace `isLoading` with `isPending`
- **Files**: `src/app/(admin)/rules/create/page.tsx`

### **2. Null Safety Issues**
- **Problem**: Database fields marked as nullable but code assumed non-null
- **Error**: `'permission.category' is possibly 'null'`
- **Solution**: Add null checks with optional chaining (`?.`) and fallbacks (`??`)
- **Files**: `src/app/(admin)/roles/components/RolePermissionsDialog.tsx`

### **3. UI Component API Mismatches**
- **Problem**: Using shadcn/ui checkbox API incorrectly
- **Error**: `Property 'onCheckedChange' does not exist`
- **Solution**: Use standard HTML input events (`onChange` with `e.target.checked`)
- **Files**: Checkbox components throughout the app

### **4. Context Structure Changes**
- **Problem**: tRPC context restructured - `ctx.user` moved to `ctx.session.user`
- **Error**: `Property 'user' does not exist on type 'Context'`
- **Solution**: Update all context access to use `ctx.session?.user`
- **Files**: `src/server/api/routers/admin.router.ts`

---

## **🗃️ Database & Query Issues**

### **5. Missing Data Relations**
- **Problem**: tRPC queries not including related data (inputs, outputs, rows)
- **Error**: Decision tables showing empty even with saved data
- **Solution**: Use `db.query` with `with` relations instead of basic `select()`
- **Files**: `src/server/api/routers/decisionTable.router.ts`

### **6. Database Field Mismatches**
- **Problem**: Querying by `id` (integer) when frontend sends `uuid` (string)
- **Error**: `Knowledge Base not found` (404 errors)
- **Solution**: Query by correct field (`uuid` instead of `id`)
- **Files**: All knowledge base API routes

### **7. Status Update Logic Missing**
- **Problem**: Documents stuck in "Processing" status forever
- **Error**: Chat blocked because documents never marked as "Processed"
- **Solution**: Add status update after successful embedding
- **Files**: Knowledge base upload workflow

---

## **🔐 Authentication & Authorization Issues**

### **8. Missing Credentials in API Calls**
- **Problem**: Axios/fetch calls not sending session cookies
- **Error**: `Request failed with status code 403`
- **Solution**: Add `withCredentials: true` (axios) or `credentials: 'include'` (fetch)
- **Files**: All frontend API calls

### **9. Permission Requirements Without Setup**
- **Problem**: Added permission checks but mock user has no permissions assigned
- **Error**: `Permission denied. Required permission: knowledge_base:upload_document`
- **Solution**: Temporarily remove permission checks until RBAC is fully configured
- **Files**: All protected API routes

### **10. Tenant Isolation Without Setup**
- **Problem**: Added tenant filtering but mock user has no tenant assigned
- **Error**: Knowledge bases not found due to tenant mismatch
- **Solution**: Remove tenant isolation checks until multi-tenancy is configured

---

## **🏗️ Infrastructure Issues**

### **11. Redis Dependency Without Implementation**
- **Problem**: Rate limiting requires Redis but Redis not set up
- **Error**: `TypeError: ctx.redis.evalsha is not a function`
- **Solution**: Disable rate limiting until Redis is properly configured
- **Files**: `src/lib/rate-limit.ts`

### **12. JavaScript Syntax Errors**
- **Problem**: Missing commas in object literals causing API routes to not compile
- **Error**: API endpoints returning 404 (not loading at all)
- **Solution**: Add missing commas in export options
- **Files**: API route files with `withApiAuth` options

---

## **🎯 Key Learnings**

### **Do's ✅**
1. **Test incrementally** - Test each RBAC component before moving to the next
2. **Maintain backward compatibility** - Keep existing functionality working during migration
3. **Use proper typing** - Leverage TypeScript to catch field/type mismatches early
4. **Check dependencies** - Ensure all required infrastructure (Redis, permissions) is set up
5. **Validate syntax** - Use linting to catch missing commas and syntax errors

### **Don'ts ❌**
1. **Don't change multiple systems simultaneously** - RBAC, database queries, and API structure all changed at once
2. **Don't assume data exists** - Always handle null/undefined cases in database queries
3. **Don't introduce breaking changes without migration** - Old queries broke when new fields were required
4. **Don't skip environment setup** - Redis rate limiting failed because Redis wasn't configured
5. **Don't modify working APIs without testing** - Knowledge base APIs were working perfectly before RBAC

### **Root Cause Analysis 🔍**
- **Main Issue**: RBAC implementation was too aggressive, changing core functionality without ensuring dependencies were in place
- **Secondary Issues**: Multiple unrelated changes (database queries, API structure, UI components) bundled together
- **Prevention**: Implement RBAC incrementally with feature flags and comprehensive testing

This comprehensive list should help prevent similar issues in future feature implementations!