# SAAS-29 Role Management CRUD Enhancement Plan

## **Epic Context**
**Epic**: SAAS-29 - Frontend State & User Experience (SEC-CLIENT-01)  
**Current Status**: Core RBAC completed, now extending with advanced role management

## **Analysis of Current Implementation**

### **✅ What Exists**
- Basic role listing with card-based UI
- Search functionality
- Permission-based access control
- Role stats display (permission count)
- System role protection

### **❌ What's Missing**
- **Table-based interface** (current uses cards)
- **Create role functionality** (button exists but no implementation)
- **Edit role functionality** (button exists but no implementation)
- **Delete role functionality** (button exists but no implementation)
- **Permission assignment interface**
- **Bulk operations**
- **Advanced filtering and sorting**

## **TanStack Table Implementation Strategy**

Based on `@/table-features` sample and `@nextjs-tanstack-tables.mdc` standards:

### **1. Table Architecture**
```typescript
// Core hooks to implement
- useRoleTableColumns
- useRoleTableSort  
- useRoleTablePagination
- useRoleTableSearch
- useRoleActions
```

### **2. Column Structure**
```typescript
interface RoleTableColumns {
  name: string;           // Primary identifier
  description: string;    // Role description
  permissionCount: number; // Number of permissions
  userCount: number;      // Number of users with role
  isSystemRole: boolean;  // System role badge
  isActive: boolean;      // Status indicator
  createdAt: Date;        // Creation date
  actions: JSX.Element;   // CRUD actions
}
```

### **3. Features to Implement**
- ✅ **Sorting**: Multi-column sort with indicators
- ✅ **Filtering**: Text-based + column-specific filters
- ✅ **Search**: Global search across name/description
- ✅ **Pagination**: Page size options + navigation
- ✅ **Row Actions**: Edit, Delete, Manage Permissions
- ✅ **Bulk Actions**: Multi-select for bulk operations
- ✅ **Loading States**: Skeleton loading during data fetch
- ✅ **Mobile Responsive**: Horizontal scroll + touch-friendly

## **New Jira Tasks to Create**

### **Task 1: TS-CLIENT-03 - Role Management Table Implementation**
**Story**: Convert role management from card-based to TanStack table interface
**Acceptance Criteria**:
- AC1: Replace card grid with TanStack table using DataTable component
- AC2: Implement useRoleTableColumns hook with proper column definitions
- AC3: Add sorting, filtering, and pagination capabilities
- AC4: Maintain existing search functionality within table
- AC5: Preserve permission-based access controls
- AC6: Add loading skeleton during data fetch
- AC7: Ensure mobile responsiveness with horizontal scroll

### **Task 2: US-ADMIN-03 - Create Role Dialog**
**Story**: Implement create role functionality with form validation
**Acceptance Criteria**:
- AC1: Create modal dialog triggered by "Create Role" button
- AC2: Form fields: name (required), description (optional), isActive toggle
- AC3: Form validation with error messages
- AC4: tRPC integration for role creation
- AC5: Success/error toast notifications
- AC6: Refresh table data after successful creation
- AC7: Handle duplicate role name validation

### **Task 3: US-ADMIN-04 - Edit Role Dialog**
**Story**: Implement edit role functionality with pre-populated form
**Acceptance Criteria**:
- AC1: Create edit modal triggered by table row "Edit" action
- AC2: Pre-populate form with existing role data
- AC3: Same validation rules as create form
- AC4: Prevent editing of system role names
- AC5: tRPC integration for role updates
- AC6: Optimistic updates with rollback on error
- AC7: Refresh table data after successful update

### **Task 4: US-ADMIN-05 - Delete Role Confirmation**
**Story**: Implement role deletion with safety checks
**Acceptance Criteria**:
- AC1: Confirmation dialog triggered by table row "Delete" action
- AC2: Show role details and impact (number of users affected)
- AC3: Prevent deletion of system roles
- AC4: Prevent deletion of roles with active users (with override option)
- AC5: tRPC integration for role deletion
- AC6: Remove row from table after successful deletion
- AC7: Handle cascade deletion options

### **Task 5: US-ADMIN-06 - Role Permission Management**
**Story**: Implement permission assignment interface for roles
**Acceptance Criteria**:
- AC1: Permission management modal triggered by "Manage Permissions" action
- AC2: Display all available permissions grouped by category
- AC3: Show current role permissions with checkboxes
- AC4: Search and filter permissions by name/category
- AC5: Bulk select/deselect by category
- AC6: tRPC integration for permission updates
- AC7: Real-time permission count updates in table

### **Task 6: TS-CLIENT-04 - Role Table Advanced Features**
**Story**: Implement advanced table features for role management
**Acceptance Criteria**:
- AC1: Multi-select rows with bulk action toolbar
- AC2: Bulk operations: activate/deactivate, delete (with confirmation)
- AC3: Column visibility toggle (show/hide columns)
- AC4: Export functionality (CSV/JSON)
- AC5: Advanced filters: status, system role, permission count range
- AC6: URL state synchronization for filters/sorting
- AC7: Keyboard navigation and accessibility compliance

### **Task 7: TS-TEST-02 - Role Management Testing**
**Story**: Comprehensive testing for role management CRUD operations
**Acceptance Criteria**:
- AC1: Unit tests for all role table hooks
- AC2: Integration tests for CRUD operations
- AC3: E2E tests for complete user workflows
- AC4: Permission-based access testing
- AC5: Error scenario testing (network failures, validation errors)
- AC6: Mobile responsiveness testing
- AC7: Performance testing with large datasets

## **Implementation Priority**

### **Phase 1: Core Table (Week 1)**
1. TS-CLIENT-03 - Table Implementation
2. US-ADMIN-03 - Create Role Dialog

### **Phase 2: CRUD Operations (Week 2)**  
3. US-ADMIN-04 - Edit Role Dialog
4. US-ADMIN-05 - Delete Role Confirmation

### **Phase 3: Advanced Features (Week 3)**
5. US-ADMIN-06 - Permission Management
6. TS-CLIENT-04 - Advanced Table Features

### **Phase 4: Testing & Polish (Week 4)**
7. TS-TEST-02 - Comprehensive Testing

## **Technical Dependencies**

### **Backend Requirements**
- ✅ `api.role.getAllWithStats` - Already exists
- ❌ `api.role.create` - Need to implement
- ❌ `api.role.update` - Need to implement  
- ❌ `api.role.delete` - Need to implement
- ❌ `api.role.updatePermissions` - Need to implement
- ❌ `api.permission.getAll` - Need to verify exists

### **Frontend Components Needed**
- ✅ `DataTable` - Use from table-features sample
- ✅ `TableSkeleton` - Use from table-features sample
- ❌ `RoleFormDialog` - Create new
- ❌ `DeleteConfirmDialog` - Create new
- ❌ `PermissionManagementDialog` - Create new
- ❌ `BulkActionToolbar` - Create new

### **Hooks to Implement**
- `useRoleTableColumns`
- `useRoleActions` (create, update, delete)
- `useRolePermissions`
- `useTableBulkActions`

## **Success Metrics**
- ✅ **Functionality**: All CRUD operations working
- ✅ **Performance**: Table loads <2s with 1000+ roles
- ✅ **UX**: Intuitive interface with clear feedback
- ✅ **Accessibility**: WCAG 2.1 AA compliance
- ✅ **Mobile**: Fully functional on mobile devices
- ✅ **Security**: All operations properly permission-gated

## **✅ JIRA TASKS CREATED**

All tasks have been successfully created and linked to SAAS-29 epic:

### **Phase 1: Core Table (Week 1)**
- ✅ **SAAS-62**: TS-CLIENT-03 - Role Management Table Implementation
- ✅ **SAAS-63**: US-ADMIN-03 - Create Role Dialog

### **Phase 2: CRUD Operations (Week 2)**  
- ✅ **SAAS-64**: US-ADMIN-04 - Edit Role Dialog
- ✅ **SAAS-65**: US-ADMIN-05 - Delete Role Confirmation

### **Phase 3: Advanced Features (Week 3)**
- ✅ **SAAS-66**: US-ADMIN-06 - Role Permission Management
- ✅ **SAAS-67**: TS-CLIENT-04 - Role Table Advanced Features

### **Phase 4: Testing & Polish (Week 4)**
- ✅ **SAAS-68**: TS-TEST-02 - Role Management Testing

## **Epic Status Update**
- **Total Stories**: 7 new stories added to SAAS-29
- **Epic Scope**: Expanded from basic RBAC to comprehensive role management
- **Implementation Ready**: All tasks have detailed acceptance criteria and technical requirements
- **Estimated Timeline**: 4 weeks for complete implementation

## **Next Steps**
1. ✅ Create Jira tasks in SAAS project - **COMPLETED**
2. ✅ Link tasks to SAAS-29 epic - **COMPLETED**
3. ⏳ Assign to development team - **PENDING**
4. ⏳ Begin Phase 1 implementation - **READY TO START**

## **Ready for Development**
All tasks are now ready for assignment and development can begin immediately with Phase 1 (SAAS-62 and SAAS-63). 