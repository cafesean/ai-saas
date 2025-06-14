# SAAS-29 Epic: Frontend State & User Experience (SEC-CLIENT-01)

## Epic Overview
Goal: To provide a fast, secure, and reactive client experience that adapts to user permissions.

## Current Status
- Epic Status: New → **Starting Development**
- All subtasks successfully linked to epic
- Ready to begin implementation

## Task List and Dependencies

### Phase 1: Core Infrastructure (Foundation)
- [X] **TS-CLIENT-01**: Implement Secure Zustand `authStore` (SAAS-61)
  - **Priority**: HIGH - Foundation for all other stories
  - **Dependencies**: None
  - **Status**: ✅ **COMPLETED** - Enhanced auth store with RBAC support

### Phase 2: Client-Side Components
- [X] **TS-CLIENT-02**: Implement Auth Store Hydration & Session Revocation Client (SAAS-44)
  - **Dependencies**: TS-CLIENT-01 ✅
  - **Status**: ✅ **COMPLETED** - Auth hydration and session monitoring implemented

- [X] **TS-CLIENT-03**: Create `<WithPermission>` UI Gating Component (SAAS-45)
  - **Dependencies**: TS-CLIENT-01 ✅
  - **Status**: ✅ **COMPLETED** - Flexible WithPermission component with utility hooks

### Phase 3: User Experience
- [X] **US-CLIENT-01**: Gate UI Controls Based on User Role (SAAS-48)
  - **Dependencies**: TS-CLIENT-03 ✅
  - **Status**: ✅ **COMPLETED** - Role-based UI gating implemented across application

### Phase 4: Admin Features
- [X] **US-ADMIN-01**: Build Role Management UI (SAAS-49)
  - **Dependencies**: TS-CLIENT-01, TS-CLIENT-03
  - **Status**: ✅ **COMPLETED** - Role management UI completed

- [ ] **US-ADMIN-02**: Create Permission Catalogue Viewer (SAAS-50)
  - **Dependencies**: None (independent UI)
  - **Status**: New

### Phase 5: Testing & Quality Assurance
- [ ] **TS-TEST-01**: Create Testing Harness for `authStore` (SAAS-46)
  - **Dependencies**: TS-CLIENT-01
  - **Status**: New

- [ ] **TS-QA-01**: Implement Negative Path E2E Tests (SAAS-47)
  - **Dependencies**: TS-TEST-01
  - **Status**: New

## Implementation Strategy

### Step 1: Create Missing Story
Create TS-CLIENT-01 in Jira as it's the foundation dependency for most other stories.

### Step 2: Follow Sequential Completion
According to workflow best practices:
1. Complete TS-CLIENT-01 entirely (New → In Progress → Ready for Code Review → Done)
2. Then move to TS-CLIENT-02 and TS-CLIENT-03 (can be parallel since they both depend on TS-CLIENT-01)
3. Continue with dependent stories

### Technical Architecture Notes
- **Auth Store**: Will use Zustand for client-side state management
- **Permissions**: Need to integrate with existing RBAC system from SAAS-27/28
- **Session Management**: Integration with NextAuth.js
- **UI Components**: Use existing Shadcn UI patterns
- **Testing**: Vitest for unit tests, Playwright for E2E

## Implementation Progress

### ✅ COMPLETED: TS-CLIENT-01 (SAAS-61) - Implement Secure Zustand `authStore`

**Implementation Details:**
- **File Modified:** `src/framework/store/auth.store.ts`
- **File Modified:** `src/framework/types/role.ts` (fixed duplicate type)

**Key Features Implemented:**
1. **Enhanced RBAC Integration:**
   - Proper TypeScript types for UserProfile, UserRole, and AuthState
   - Permission management with `hasPermission()` helper
   - Support for multiple roles and permission slugs
   - Integration with NextAuth.js session structure

2. **Backward Compatibility:**
   - Maintained all legacy methods for existing code
   - Preserved existing store structure for gradual migration
   - Legacy field mapping for orgUser, roles, etc.

3. **Security Enhancements:**
   - Selective persistence (partialize) for security
   - Proper logout clearing all sensitive data
   - Loading states for auth operations
   - Session data management

4. **Helper Functions:**
   - `getAuthState()`, `isAuthenticated()`, `hasPermission()`
   - `getUserPermissions()`, `getCurrentUser()`, `getCurrentRole()`

**Technical Architecture:**
- Converts legacy CRUD permissions to new permission slugs format
- Handles SessionRole to UserRole mapping
- Extracts permissions from role policies
- Uses proper storage key `app-auth-storage` for testing compatibility

## Implementation Progress - Phase 2

### ✅ COMPLETED: TS-CLIENT-02 (SAAS-44) - Implement Auth Store Hydration & Session Revocation Client

**Implementation Details:**
- **Files Created:**
  - `src/framework/lib/auth-hydration.ts` - Core hydration and session monitoring logic
  - `src/framework/hooks/useAuthSession.ts` - React hooks for easy component integration

**Key Features Implemented:**
1. **Auth Store Hydration:**
   - `hydrateAuthStore(session)` function for seamless NextAuth integration
   - Automatic session data extraction and auth store population
   - Error handling and fallback to logout on hydration failure

2. **WebSocket Session Monitoring:**
   - Real-time session revocation detection
   - Automatic reconnection with exponential backoff
   - Handles session-revoked, permissions-updated, and role-changed events
   - Secure user ID validation for message filtering

3. **React Hook Integration:**
   - `useAuthSession()` - Primary hook for components
   - `usePermission(slug)` - Simple permission checking
   - `usePermissions(slugs[])` - Multiple permission checking
   - `useCurrentUser()` - User data access

4. **Security Features:**
   - Immediate client-side cleanup on session revocation
   - Graceful fallback to login page on errors
   - Connection state management and monitoring utilities

### ✅ COMPLETED: TS-CLIENT-03 (SAAS-45) - Create `<WithPermission>` UI Gating Component

**Implementation Details:**
- **File Created:** `src/components/auth/WithPermission.tsx` - Comprehensive UI gating component

**Key Features Implemented:**
1. **Flexible Permission Checking:**
   - Single permission: `permission="workflow:create"`
   - Multiple permissions (ALL): `permissions={["admin:users", "admin:roles"]}`
   - Any permission (ANY): `anyPermissions={["workflow:read", "workflow:create"]}`
   - Role-based access: `role="Admin"` or `role={["Admin", "Super Admin"]}`

2. **Advanced Features:**
   - Custom authorization logic with `customCheck` function
   - Fallback content for unauthorized access
   - Hide option for seamless UI (renders nothing when unauthorized)
   - Loading states with customizable loading components
   - CSS class support for styling

3. **Multiple Usage Patterns:**
   - Component: `<WithPermission permission="...">...</WithPermission>`
   - Hook: `useWithPermission({ permission: "..." })`
   - HOC: `withPermission(Component, { permission: "..." })`

4. **Utility Components:**
   - `<AdminOnly>` - Quick admin-only wrapper
   - `<SuperAdminOnly>` - Super admin wrapper
   - `<RequirePermissions>` - Permission-based wrapper

5. **TypeScript Support:**
   - Full type safety with proper interfaces
   - Excellent IDE intellisense and autocomplete
   - Proper prop validation and inference

### ✅ COMPLETED: US-CLIENT-01 (SAAS-48) - Gate UI Controls Based on User Role

**Implementation Details:**
- **Files Modified:**
  - `src/components/Sidebar/Sidebar.tsx` - Enhanced with permission-based navigation
  - `src/app/(admin)/workflows/page.tsx` - Added permission gating to workflow actions
  - `src/app/(admin)/demo/rbac/page.tsx` - Created comprehensive RBAC demo page

**Key Features Implemented:**
1. **Enhanced Sidebar Navigation:**
   - Permission-based visibility for navigation items
   - Admin-only sections with visual separation
   - Role-based access to settings and management features
   - Proper permission requirements for each navigation item

2. **Workflow Management UI Gating:**
   - "Create Workflow" button requires `workflow:create` permission
   - Dropdown actions gated by specific permissions:
     - Edit: `workflow:update`
     - Duplicate: `workflow:create`
     - Publish/Pause: `workflow:publish`
     - Export: `workflow:read`
     - Delete: `workflow:delete`

3. **Comprehensive RBAC Demo Page:**
   - Live demonstration of all WithPermission patterns
   - Permission hook examples with real-time status
   - Role-based access control examples
   - Advanced permission combinations (ALL/ANY/Custom)
   - Utility component demonstrations

4. **Permission Mapping:**
   - Models: `models:read`, `models:manage`
   - Workflows: `workflow:read`, `workflow:create`, `workflow:update`, `workflow:delete`, `workflow:publish`
   - Admin: `admin:role_management`, `admin:user_management`, `admin:full_access`
   - Content: `documents:read`, `content:read`, `widgets:read`
   - Settings: `organization:manage`, `api_keys:manage`, `workflow:manage_templates`

## Current Focus
Moving to Phase 4: Admin Features - US-ADMIN-01 and US-ADMIN-02. 

## Next Actions

### Immediate: Start Phase 4 - Admin Features

**Next Story: SAAS-49 (US-ADMIN-01) - Build Role Management UI**

**Implementation Plan:**
1. **Review Requirements**: Understand role management UI specifications
2. **Design Components**: Plan role management interface components
3. **Create Role Management Page**: Build admin interface for role CRUD operations
4. **Implement Role Forms**: Create/edit role forms with permission assignment
5. **Add Role Table**: Display existing roles with management actions
6. **Integration**: Connect with backend APIs and auth store
7. **Testing**: Verify role management functionality

**Key Features to Implement:**
- Role listing table with search/filter
- Create new role form with permission selection
- Edit existing role with permission updates
- Delete role with proper validation
- Permission assignment interface
- Role hierarchy visualization
- Audit trail for role changes

**Files to Create/Modify:**
- `src/app/(admin)/roles/page.tsx` (main role management page)
- `src/app/(admin)/roles/components/` (role management components)
- Role-specific forms and tables
- Integration with existing auth infrastructure

## Technical Notes

### Completed Infrastructure
- ✅ Zustand auth store with RBAC support
- ✅ Auth hydration and session management
- ✅ WithPermission component ecosystem
- ✅ UI gating across application
- ✅ Permission-based navigation
- ✅ WebSocket session monitoring
- ✅ Comprehensive React hooks

### Permission System
- ✅ Permission slug format: `module:action` (e.g., `workflow:create`)
- ✅ Role-based access control
- ✅ Multiple permission checking patterns
- ✅ Custom authorization logic support

### Ready for Admin Phase
All client-side infrastructure is complete and ready for admin feature development. The foundation provides:
- Secure state management
- Real-time session handling  
- Flexible UI gating
- Comprehensive permission checking
- TypeScript safety throughout

## Dependencies Status
- **Backend APIs**: Need to verify role management endpoints exist
- **Database Schema**: Confirm role/permission tables are ready
- **tRPC Routes**: Check if role management routes are implemented
- **UI Components**: Leverage existing table/form components from shadcn 