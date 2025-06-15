Of course. I will regenerate the plan to remove the "Phase" structure and instead use explicit dependencies to make the parent/child relationships between tasks perfectly clear. This format is better suited for direct import into a project management tool like Jira where tasks are linked.

Here is the final, comprehensive implementation plan for the Organization Management Module.

---

## **Organization Management Module: Complete Epic & Stories**

### **1. Overview**

This document provides a full breakdown of the work required to implement the **Organization Management Module**. The plan is structured with a single parent Epic and a series of stories, each with explicitly defined dependencies to clarify the required development sequence. This structure is designed to be directly translatable into Jira tickets.

The implementation will strictly adhere to the architectural principles and patterns established in the SAMA-Compliant RBAC Framework and the SAAS-29 Role Management module.

### **2. Parent Epic**

**Epic: Organization Management Module (ORG-MGMT-01)**
*   **Goal:** Implement a comprehensive Organization Management module that allows administrators to manage organizations (tenants), assign users and roles, and configure settings, following established platform patterns for security, scalability, and user experience.
*   **Business Value:**
    *   Enables proper multi-tenant organization management.
    *   Supports scalable tenant isolation and access control.
    *   Provides a foundation for advanced tenant-specific features and billing.
*   **Dependencies:** SAMA-Compliant RBAC Framework (V4 - Final) must be fully implemented.

---

### **3. Stories & Technical Tasks**

### **Module Foundation**

#### **Story 1: Foundation and Type Definition (TS-ORG-01)**
*   **Title:** Create Organization Types, Interfaces, and Foundation Components
*   **Description:** As a developer, I need to set up the foundational TypeScript types, interfaces, and tRPC router structure for the Organization Management module to ensure type safety and align with existing patterns.
*   **Acceptance Criteria:**
    1.  A `src/types/organization.ts` file is created with comprehensive interfaces for `Organization`, `OrganizationUser`, etc.
    2.  Organization status enums (e.g., `ACTIVE`, `INACTIVE`) are defined as constants.
    3.  Permission slugs (`organization:create`, `organization:read`, etc.) are added to the central `src/constants/permissions.ts` file.
    4.  A skeleton `organization.router.ts` file is created under `src/server/api/routers/` with Zod schema placeholders.
*   **Dependencies:** None.
*   **Relative Effort:** S

#### **Story 2: Organization tRPC Router (TS-ORG-02)**
*   **Title:** Implement Organization tRPC Router with CRUD and Statistics
*   **Description:** As a developer, I need to implement a comprehensive tRPC router for all organization operations, including full CRUD, user statistics, and permission-gated access.
*   **Acceptance Criteria:**
    1.  An `organizationRouter.getAllWithStats` query is implemented, returning a paginated list of organizations that includes a `_count.users` property for each.
    2.  An `organizationRouter.getById` query returns a single organization's detailed information.
    3.  `create`, `update`, and `delete` (soft delete via `isActive` flag) mutations are implemented.
    4.  All mutations are protected by the `hasPermission` middleware using the slugs defined in `TS-ORG-01`.
    5.  All input is validated using Zod schemas.
    6.  All database queries correctly use `db.query` with `with` relations to prevent N+1 issues.
*   **Dependencies:** `TS-ORG-01`.
*   **Relative Effort:** L
*   **Key Files:** `src/server/api/routers/organization.router.ts`.

---
### **Core UI and Table**

#### **Story 3: Organization Data Table (US-ORG-01)**
*   **Title:** As an Admin, I want to view, sort, and filter all organizations in a data table
*   **Description:** Implement the core organization data table using TanStack Table, featuring sorting, filtering, pagination, and key statistics, ensuring a responsive and informative user experience.
*   **Acceptance Criteria:**
    1.  The table on the `/organizations` page correctly displays organization data (Name, User Count, Status, Last Updated).
    2.  Column sorting and global text-based filtering are functional.
    3.  Pagination controls are present and functional.
    4.  A skeleton loader is displayed while data is being fetched (`isPending`).
    5.  The table is responsive and usable on mobile devices.
    6.  Access to the page is gated by the `organization:read` permission.
*   **Dependencies:** `TS-ORG-02`.
*   **Relative Effort:** M
*   **Key Files:** `src/app/(admin)/organizations/page.tsx`, `src/app/(admin)/organizations/components/OrganizationDataTable.tsx`.

---
### **CRUD Operations**

#### **Story 4: Create Organization Dialog (US-ORG-02)**
*   **Title:** As an Admin, I want to create a new organization
*   **Description:** Implement a modal dialog for creating a new organization, including comprehensive form validation, business information fields, and logo upload capabilities.
*   **Acceptance Criteria:**
    1.  A "Create Organization" button on the main table page, gated by `organization:create` permission, opens the creation dialog.
    2.  The form includes fields for Name, Description, Website, Address, and a logo upload component.
    3.  Client-side validation (with React Hook Form & Zod) provides immediate user feedback.
    4.  On successful submission, a success toast is displayed, and the data table automatically refreshes.
*   **Dependencies:** `US-ORG-01`.
*   **Relative Effort:** M
*   **Key Files:** `src/app/(admin)/organizations/components/CreateOrganizationDialog.tsx`.

#### **Story 5: Edit Organization Dialog (US-ORG-03)**
*   **Title:** As an Admin, I want to edit an existing organization's details
*   **Description:** Implement a modal dialog for editing an organization's details, ensuring the form is pre-populated and system-critical organizations are protected from modification.
*   **Acceptance Criteria:**
    1.  An "Edit" action, gated by `organization:update` permission, is available for each non-system organization in the table.
    2.  The dialog opens with form fields pre-populated with the selected organization's data.
    3.  The "System Default" organization is identified and cannot be edited.
    4.  On successful update, a success toast is shown, and the table refreshes.
*   **Dependencies:** `US-ORG-01`.
*   **Relative Effort:** M
*   **Key Files:** `src/app/(admin)/organizations/components/EditOrganizationDialog.tsx`.

#### **Story 6: Delete Organization Dialog (US-ORG-04)**
*   **Title:** As an Admin, I want to delete an organization after understanding the impact
*   **Description:** Implement a secure deletion flow using a confirmation dialog that performs an impact assessment and uses a soft-delete pattern.
*   **Acceptance Criteria:**
    1.  A "Delete" action, gated by `organization:delete` permission, opens a confirmation dialog.
    2.  The dialog displays the name of the organization and warns of the consequences (e.g., "This will affect X users.").
    3.  The "System Default" organization cannot be deleted.
    4.  Deletion is a soft delete that sets the `isActive` flag to `false`.
*   **Dependencies:** `US-ORG-01`.
*   **Relative Effort:** M
*   **Key Files:** `src/app/(admin)/organizations/components/DeleteOrganizationDialog.tsx`.

---
### **User & Context Management**

#### **Story 7: Manage Organization Users (US-ORG-05)**
*   **Title:** As an Admin, I want to manage which users belong to an organization and what roles they have
*   **Description:** Implement a user management interface that allows admins to add users to an organization, remove them, and assign organization-specific roles.
*   **Acceptance Criteria:**
    1.  A "Manage Users" action on the organization table, gated by `organization:manage_users`, opens the management dialog.
    2.  The dialog displays a list of users currently in the organization and their assigned roles.
    3.  The interface allows searching for and adding new users to the organization.
    4.  An admin can change a user's role specifically for that organization.
*   **Dependencies:** `US-ORG-01`.
*   **Relative Effort:** L
*   **Key Files:** `src/app/(admin)/organizations/components/ManageUsersDialog.tsx`.

#### **Story 8: Organization Context Switching (US-ORG-06)**
*   **Title:** As a User in multiple organizations, I want to easily switch between them
*   **Description:** Implement a global organization context switcher in the UI that allows multi-tenant users to change their active organization, updating their session and permissions accordingly.
*   **Acceptance Criteria:**
    1.  A dropdown menu in the main navigation bar lists all organizations the user belongs to.
    2.  Selecting an organization updates the active tenant in the client-side `authStore`.
    3.  The user's permissions are re-fetched/updated to reflect their role in the new organization.
    4.  All subsequent API requests automatically use the new organization context.
*   **Dependencies:** `TS-ORG-02`.
*   **Relative Effort:** M

---
### **Advanced Features**

#### **Story 9: Organization Settings Page (US-ORG-07)**
*   **Title:** As an Admin, I want a dedicated settings page for each organization
*   **Description:** Implement an organization-specific settings page where admins can manage business information, branding, and feature toggles.
*   **Acceptance Criteria:**
    1.  A new route `(admin)/organizations/[uuid]/settings` is created, accessible from the main table.
    2.  The page contains forms for updating business information and branding (logo).
    3.  A section for managing feature flags specific to that organization is present.
    4.  All operations on this page are gated by the `organization:admin` permission.
*   **Dependencies:** `TS-ORG-02`.
*   **Relative Effort:** L

#### **Story 10: Advanced Table Features (US-ORG-08)**
*   **Title:** As a Power User, I want advanced table controls for bulk operations and data export
*   **Description:** Enhance the `OrganizationDataTable` with advanced features including row selection for bulk actions, data export, and column customization.
*   **Acceptance Criteria:**
    1.  Checkboxes are present for each row, allowing for multi-row selection.
    2.  When rows are selected, a "Bulk Actions" button appears (e.g., "Deactivate Selected").
    3.  An "Export" button allows the user to download the current table view as a CSV file.
    4.  A column visibility dropdown allows users to show or hide columns.
*   **Dependencies:** `US-ORG-01`.
*   **Relative Effort:** M