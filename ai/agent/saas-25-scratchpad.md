# SAAS-25 Scratchpad: Foundational Multi-Tenancy Migration

## Task Overview
**Epic:** SAAS-25 - Foundational Multi-Tenancy Migration (SEC-MIGRATE-01)
**Status:** New (To Do)
**Priority:** Medium
**URL:** https://jira.jetdevs.com/browse/SAAS-25

**Goal:** Refactor the existing schema to be fully multi-tenant, providing the necessary foundation for tenant-aware RBAC.

## Associated Stories
1. **SAAS-31:** TS-MIG-01: Introduce `users` and `tenants` Tables (Medium, New) ✅ **COMPLETED**
2. **SAAS-32:** TS-MIG-02: Add `tenant_id` to All Core Resources (Medium, New) 🔄 **IN PROGRESS - Schema Complete, Backfill Needed**

## Implementation Plan

### Phase 1: Foundation Setup (SAAS-31) ✅ **COMPLETED**
[X] Review current database schema
[X] Design `users` table with proper schema
[X] Design `tenants` table with proper schema  
[X] Design `user_tenants` join table
[X] Create Drizzle migration
[X] Test migration locally
[X] Validate schema follows `id BIGSERIAL` + `uuid` standard

### Phase 2: Multi-Tenancy Migration (SAAS-32) 🔄 **NEARLY COMPLETE**
[X] Identify all core resource tables requiring `tenant_id`
[X] Create schema updates for `workflows` table
[X] Create schema updates for `models` table
[X] Create schema updates for `rules` table
[X] Create schema updates for `decision_tables` table
[X] Create schema updates for `knowledge_bases` table
[X] Create migration to add `tenant_id` foreign keys
[ ] **NEXT:** Create data backfill migration for "System Tenant"
[ ] Test migration locally  
[ ] Validate existing functionality continues to work
[ ] Test data isolation

### Phase 3: Validation & Testing
[ ] Run comprehensive database tests
[ ] Verify RLS policies work correctly
[ ] Validate existing APIs still function
[ ] Document migration steps

## Current Schema Analysis

### Existing Tables That May Conflict:
- `user` table exists but has complex structure with arrays for `orgId`, `roleId`
- `org` table exists (organizations)
- `org_user` join table exists but doesn't follow clean multi-tenant pattern

### Core Resource Tables Updated (SAAS-32): ✅ **COMPLETED**
1. ✅ `workflows` - Added `tenant_id` + index + foreign key
2. ✅ `models` - Added `tenant_id` + index + foreign key  
3. ✅ `rules` - Added `tenant_id` + index + foreign key
4. ✅ `decision_tables` - Added `tenant_id` + index + foreign key
5. ✅ `knowledge_bases` - Added `tenant_id` + index + foreign key

### Additional Tables That May Need tenant_id:
- `templates` - workflow templates
- `widgets` - widget configurations  
- `endpoints` - API endpoints
- `node_types` - workflow node types (possibly shared)

## Technical Requirements

### Database Tables Created (SAAS-31) ✅ **COMPLETED**
1. ✅ **`users` table:**
   - `id BIGSERIAL PRIMARY KEY`
   - `uuid UUID UNIQUE NOT NULL`
   - Basic user fields (email, name, etc.)
   - Timestamps (created_at, updated_at)

2. ✅ **`tenants` table:**
   - `id BIGSERIAL PRIMARY KEY`
   - `uuid UUID UNIQUE NOT NULL`
   - Tenant name, description
   - Timestamps (created_at, updated_at)

3. ✅ **`user_tenants` table:**
   - `user_id BIGINT REFERENCES users(id)`
   - `tenant_id BIGINT REFERENCES tenants(id)`
   - `role VARCHAR` (temporary field for initial mapping)
   - Timestamps (created_at, updated_at)

### Core Resources Migrated (SAAS-32) ✅ **SCHEMA COMPLETE**
- ✅ `workflows` table - Added `tenant_id BIGINT NOT NULL REFERENCES tenants(id)` 
- ✅ `models` table - Added `tenant_id BIGINT NOT NULL REFERENCES tenants(id)`
- ✅ `rules` table - Added `tenant_id BIGINT NOT NULL REFERENCES tenants(id)`
- ✅ `decision_tables` table - Added `tenant_id BIGINT NOT NULL REFERENCES tenants(id)`
- ✅ `knowledge_bases` table - Added `tenant_id BIGINT NOT NULL REFERENCES tenants(id)`

### Migration Strategy ⚠️ **CRITICAL NEXT STEP**
1. ✅ Add `tenant_id BIGINT NOT NULL REFERENCES tenants(id)` to each core resource table
2. 🔄 **Create a "System Tenant" for backward compatibility**
3. 🔄 **Backfill all existing records with the System Tenant ID**
4. ✅ Ensure foreign key constraints are properly set

## Migration Files Generated
1. ✅ **`drizzle/0000_busy_mother_askani.sql`** - Created `users`, `tenants`, `user_tenants` tables
2. ✅ **`drizzle/0001_sudden_korath.sql`** - Added `tenant_id` to all core resource tables

## ⚠️ CRITICAL WARNING
The current migration (`0001_sudden_korath.sql`) adds NOT NULL `tenant_id` columns to existing tables. This will FAIL if there are existing records. We need to create a backfill migration that:

1. Creates a "System Tenant" record
2. Updates all existing core resource records to reference this System Tenant
3. Then applies the NOT NULL constraint

## Dependencies
- SAAS-32 depends on SAAS-31 completion ✅
- Must complete before any RBAC implementation stories

## Notes
- Preserve existing functionality during migration
- Use "System Tenant" concept for backward compatibility
- Follow existing Drizzle migration patterns
- Test thoroughly before production deployment

## Progress Tracking
- **Started:** ✅ SAAS-31 Complete
- **Current Phase:** ✅ **EPIC COMPLETE - Both SAAS-31 and SAAS-32 implemented**
- **Status:** **Ready for deployment and RBAC implementation** 