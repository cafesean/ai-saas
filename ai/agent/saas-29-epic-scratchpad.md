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
- [ ] **TS-CLIENT-02**: Implement Auth Store Hydration & Session Revocation Client (SAAS-44)
  - **Dependencies**: TS-CLIENT-01
  - **Status**: New

- [ ] **TS-CLIENT-03**: Create `<WithPermission>` UI Gating Component (SAAS-45)
  - **Dependencies**: TS-CLIENT-01
  - **Status**: New

### Phase 3: User Experience
- [ ] **US-CLIENT-01**: Gate UI Controls Based on User Role (SAAS-48)
  - **Dependencies**: TS-CLIENT-03
  - **Status**: New

### Phase 4: Admin Features
- [ ] **US-ADMIN-01**: Build Role Management UI (SAAS-49)
  - **Dependencies**: TS-CLIENT-01, TS-CLIENT-03
  - **Status**: New

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

## Current Focus
✅ TS-CLIENT-01 complete! Ready to move to next phase: TS-CLIENT-02 and TS-CLIENT-03 