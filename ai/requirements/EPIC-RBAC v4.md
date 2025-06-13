### **SAMA-Compliant RBAC Framework: Complete Implementation Plan (V4 - Final)**

### 1. Overview & Architectural Principles

This document provides the complete set of epics and stories required to implement a robust, multi-tenant, auditable, and SAMA-compliant Role-Based Access Control (RBAC) framework. This plan is based on the provided Next.js 15 application schema and incorporates all previous feedback on security, scalability, and operations.

The architecture is founded on these key principles:

*   **Database Standard:** The platform will use `id BIGSERIAL` as the `PRIMARY KEY` for stable internal foreign key joins and a `uuid` column (`UNIQUE NOT NULL`) for all external API exposure.
*   **Strict Tenant Isolation:** The framework enforces **strict tenant partitioning by default** using database Row-Level Security (RLS). Cross-tenant sharing is not supported in this version.
*   **Granular & Flexible Permissions:** The framework is built on a `permissions` catalogue, allowing roles to be composed of fine-grained permission slugs (e.g., `decision_table:publish`). A user's effective permissions are the **UNION** of all permissions granted by their assigned roles within a given tenant.
*   **Real-Time Security:** Permission changes are propagated to active user sessions in real-time.

### 2. Implementation Sequence

The work is organized into six sequential epics. Development must follow this order due to strict dependencies.
1.  **SEC-MIGRATE-01:** Foundational Multi-Tenancy Migration
2.  **SEC-INFRA-01:** Infrastructure & CI for Next.js 15
3.  **SEC-DB-01:** New RBAC Database & Security Foundation
4.  **SEC-API-01:** API & Logic Layer Enforcement
5.  **SEC-CLIENT-01:** Frontend State & User Experience
6.  **SEC-OPS-01:** Operations & Compliance

---
### **Epic 1: Foundational Multi-Tenancy Migration (SEC-MIGRATE-01)**
**(No changes in this epic)**
**Goal:** To refactor the existing schema to be fully multi-tenant, providing the necessary foundation for tenant-aware RBAC.

*   **TS-MIG-01: Introduce `users` and `tenants` Tables**
    *   **Description:** Create the core tables for managing users and tenants (organizations), as they are absent from the current schema.
    *   **Acceptance Criteria:**
        1.  A Drizzle migration is created for a `users` table and a `tenants` table.
        2.  Both tables follow the `id BIGSERIAL` + `uuid` standard.
        3.  A `user_tenants` join table is created to manage user membership within tenants, including a temporary `role` string field for initial data mapping if needed.
    *   **Relative Effort:** M

*   **TS-MIG-02: Add `tenant_id` to All Core Resources**
    *   **Description:** Add a `tenant_id` foreign key to all existing top-level resource tables to enable data isolation. This is the most critical prerequisite for RBAC.
    *   **Acceptance Criteria:**
        1.  A migration adds a `tenant_id` foreign key (referencing `tenants.id`) to `workflows`, `models`, `rules`, `decision_tables`, and `knowledge_bases`.
        2.  The `tenant_id` column is set to `NOT NULL`.
        3.  A data backfill step in the migration assigns all existing resources to a default "System Tenant" to prevent data loss and ensure existing functionality continues to work for a single "super-admin" context.
    *   **Dependencies:** `TS-MIG-01`.
    *   **Relative Effort:** XL
---
### **Epic 2: Infrastructure & CI (SEC-INFRA-01)**
**Goal:** To prepare the development and CI/CD environment for a Next.js 15 application.

*   **TS-CI-01: Update CI for Node.js 18.17+ & Turbopack**
    *   **Description:** Align the CI environment with Next.js 15's requirements.
    *   **Acceptance Criteria:**
        1.  `package.json` "engines" field is set to `>=18.17.0`.
        2.  The CI build matrix is updated to use a compatible Node.js version.
        3.  The build step in CI uses the `--turbo` flag.
    *   **Relative Effort:** S

*   **TS-SEC-01: Harden Content Security Policy (CSP)**
    *   **Description:** Update the application's CSP to account for new communication channels required by real-time features.
    *   **Acceptance Criteria:**
        1.  The CSP is reviewed and made as strict as possible to mitigate XSS risks.
        2.  The policy explicitly whitelists the WebSocket origin and any domains specified in `serverActions.allowedOrigins`.
    *   **Relative Effort:** S

---
### **Epic 3: New RBAC Database & Security Foundation (SEC-DB-01)**
**Goal:** To establish the new, granular RBAC schema and secure the database with Row-Level Security.

*   **TS-DB-01: Implement Core RBAC Database Schema**
    *   **Description:** Create the foundational database tables required to model roles, permissions, and user assignments within a multi-tenant structure.
    *   **Acceptance Criteria:**
        1.  A Drizzle migration is created for the following tables: `roles`, `permissions`, `role_permissions`, and `user_roles`.
        2.  The `user_roles` table includes foreign keys to `users.id` and `tenants.id` and has a composite `UNIQUE (user_id, tenant_id, role_id)` constraint to prevent duplicate role assignments.
        3.  All new tables adhere to the `id BIGSERIAL` + `uuid` standard.
    *   **Dependencies:** `SEC-MIGRATE-01`.
    *   **Relative Effort:** M

*   **TS-DB-02: Implement Permission Catalogue and Role Seeding**
    *   **Description:** Define the complete set of permission slugs, create a script to seed the database with default roles, and map permissions to them.
    *   **Acceptance Criteria:**
        1.  A file at `src/constants/permissions.ts` is created as the single source of truth for all permission slugs (e.g., `decision_table:create`, `decision_table:publish`).
        2.  A CI script is created to validate that the `permissions` table in the database is in sync with the constant file.
        3.  A seed script is created to populate default roles (e.g., `Admin`, `Analyst`, `Viewer`) and associate them with the correct permissions in the `role_permissions` table.
    *   **Dependencies:** `TS-DB-01`.
    *   **Relative Effort:** S

*   **TS-DB-03: Implement and Automate RLS Policy Testing**
    *   **Description:** Enable and configure PostgreSQL RLS on all multi-tenant tables to create a hard security wall between tenants at the database level.
    *   **Acceptance Criteria:**
        1.  RLS is enabled via migration on all tables containing a `tenant_id` column.
        2.  A security policy is created that permits access only when a row's `tenant_id` matches a session variable set on every connection (e.g., `current_setting('app.tenant_id')`).
        3.  An automated test script is added to the CI pipeline to verify that a user session configured for `tenant_A` cannot read, write, or delete data belonging to `tenant_B`. This test must run on every migration.
    *   **Dependencies:** `TS-MIG-02`.
    *   **Relative Effort:** L

---
### **Epic 4: API & Logic Layer Enforcement (SEC-API-01)**
**Goal:** To secure all backend endpoints with multiple layers of authentication, authorization, and abuse prevention.

*   **TS-API-01: Secure App Router Route Handlers**
    *   **Description:** Secure all non-tRPC API routes by mandating an explicit, server-side session check to prevent middleware-bypass vulnerabilities.
    *   **Acceptance Criteria:**
        1.  A helper function, `getServerSessionOrThrow()`, is created to centralize session validation logic.
        2.  This function is imported and called at the beginning of every `POST`, `PUT`, `DELETE`, etc., handler in the `/app/api/` directory.
        3.  Requests without a valid session are rejected with a `401 Unauthorized` status.
    *   **Dependencies:** `SEC-DB-01`.
    *   **Relative Effort:** M

*   **TS-TRPC-01: Implement `hasPermission` tRPC Middleware with Caching**
    *   **Description:** Create and apply a performant tRPC middleware to protect all procedures with fine-grained permission checks, including caching for performance and automated audit logging for failures.
    *   **Acceptance Criteria:**
        1.  A `protectedProcedure.use(hasPermission('permission:slug'))` middleware is created.
        2.  The user's complete permission set for their active tenant is fetched and cached in Redis using a composite key `(userId:tenantId)`.
        3.  The cache for a user is automatically invalidated upon a role change, tenant switch, or via the real-time session revocation channel.
        4.  The middleware automatically calls `createAuditLog` with a `PERMISSION_DENIED` action if an authorization check fails.
        5.  All tRPC mutations and relevant queries are wrapped with this middleware.
    *   **Dependencies:** `TS-DB-02`.
    *   **Relative Effort:** L


*   **TS-API-02: Harden Server Actions**
    *   **Description:** Secure all Server Actions to prevent unauthorized access and CSRF attacks.
    *   **Acceptance Criteria:**
        1.  All Server Actions are wrapped in a helper function that performs a `hasPermission()` check before executing the core logic.
        2.  `serverActions.allowedOrigins` in `next.config.js` is configured with a strict list of allowed domains.
    *   **Dependencies:** `TS-TRPC-01`.
    *   **Relative Effort:** M

*   **TS-API-03: Implement API Rate Limiting**
    *   **Description:** Protect critical authentication and high-traffic API endpoints from brute-force attacks and abuse.
    *   **Acceptance Criteria:**
        1. A rate-limiting library (e.g., `upstash/ratelimit`) is integrated.
        2. Rate limiting is applied to the login endpoint.
        3. Rate limiting is applied to key tRPC procedures and API routes identified as high-risk.
    *   **Dependencies:** `TS-API-01`.
    *   **Relative Effort:** M


*   **TS-TRPC-01: Implement `hasPermission` tRPC Middleware with Caching**
    *   **Description:** Create and apply a performant tRPC middleware to protect all procedures with fine-grained permission checks, including caching for performance and automated audit logging for failures.
    *   **Acceptance Criteria:**
        1.  A `protectedProcedure.use(hasPermission('permission:slug'))` middleware is created.
        2.  The user's complete permission set for their active tenant is fetched and cached in Redis using a composite key `(userId:tenantId)`.
        3.  The cache for a user is automatically invalidated upon a role change, tenant switch, or via the real-time session revocation channel.
        4.  The middleware automatically calls `createAuditLog` with a `PERMISSION_DENIED` action if an authorization check fails.
        5.  All tRPC mutations and relevant queries are wrapped with this middleware.
    *   **Dependencies:** `TS-DB-02`.
    *   **Relative Effort:** L


*   **TS-DX-01: Implement ESLint Safeguards for API Endpoints (NEW)**
    *   **Description:** Create custom ESLint rules to prevent developers from accidentally creating unprotected API endpoints, ensuring security policies are consistently applied.
    *   **Acceptance Criteria:**
        1.  An ESLint rule is created that flags any exported tRPC procedure that does not include a `.use(hasPermission(...))` call.
        2.  A separate ESLint rule is created that flags any exported Route Handler function (`GET`, `POST`, etc.) in `/app/api/` that does not call `getServerSessionOrThrow()`.
        3.  The CI pipeline is configured to fail if these linting rules are violated.
    *   **Dependencies:** `TS-TRPC-01`, `TS-API-01`.
    *   **Relative Effort:** S

---
### **Epic 5: Frontend State & User Experience (SEC-CLIENT-01)**
**Goal:** To provide a fast, secure, and reactive client experience that adapts to user permissions.

*   **Dependencies:** This epic depends on the completion of **SEC-API-01**.


*   **US-CLIENT-01: Gate UI Controls Based on User Role (NEW)**
    *   **Description:** As a System Administrator, I want UI controls to be disabled or hidden for users who lack the permission to use them, so that the user interface accurately reflects a user's capabilities and prevents confusion.
    *   **Acceptance Criteria:**
        1.  A user with the `viewer` role logs in.
        2.  The "Publish", "Create New", and "Delete" buttons throughout the Decision Engine UI are either hidden or visibly disabled.
        3.  The "Edit" button navigates to a read-only view of the artifact.
        4.  The `<WithPermission>` component is used to implement this gating logic.
    *   **Dependencies:** `TS-CLIENT-03`.
    *   **Relative Effort:** M


*   **TS-CLIENT-01: Implement Secure Zustand `authStore`**
    *   **Description:** Create a new Zustand store to manage client-side authentication state, persisted to `localStorage`, while ensuring JWTs are handled securely.
    *   **Acceptance Criteria:**
        1.  A Zustand store is created at `src/store/auth.store.ts`.
        2.  JWTs are handled exclusively in secure, `HttpOnly` cookies via NextAuth; the raw token is never exposed to the client-side store.
        3.  The store shape includes `status`, `user: { uuid, name }`, `permissions: string[]`, and `activeTenant: { uuid, name }`.
        4.  The `persist` middleware is configured with the key `"app-auth-storage"`.
    *   **Relative Effort:** S

*   **TS-CLIENT-02: Implement Auth Store Hydration & Session Revocation Client**
    *   **Description:** Populate the `authStore` from the NextAuth session and subscribe to a real-time channel to handle session invalidation events.
    *   **Acceptance Criteria:**
        1.  A `hydrateAuthStore(session)` helper function populates the Zustand store with user data and permissions derived from the NextAuth session.
        2.  The application subscribes to a WebSocket channel for session events.
        3.  Upon receiving a "session-revoked" message for the current user, the client-side store is cleared and the user is redirected to the login page.
    *   **Dependencies:** `TS-API-02`.
    *   **Relative Effort:** M

*   **TS-CLIENT-03: Create `<WithPermission>` UI Gating Component**
    *   **Description:** Build a reusable React component that conditionally renders its children based on whether the current user has the required permission slug.
    *   **Acceptance Criteria:**
        1.  A `<WithPermission slug="some:permission">` component is created.
        2.  The component reads the user's `permissions` array from the `authStore`.
        3.  The component renders its `children` if the required slug exists in the array.
        4.  If the user lacks permission, the component can either render `null` or render its `children` in a disabled state, configurable via a prop.
    *   **Relative Effort:** M


*   **US-ADMIN-01: Build Role Management UI**
    *   **Description:** Create a user interface for administrators to manage roles and their associated permissions.
    *   **Acceptance Criteria:**
        1.  A new page is created at `/admin/roles`.
        2.  The UI displays a list of all existing roles.
        3.  Administrators can create a new role, edit an existing role's name, and delete a role.
        4.  When editing a role, the UI shows a checklist of all available permissions, allowing the admin to grant or revoke them.
    *   **Relative Effort:** L

*   **US-ADMIN-02: Create Permission Catalogue Viewer**
    *   **Description:** Build a simple, read-only interface for administrators to view all available system permissions and their descriptions.
    *   **Acceptance Criteria:**
        1.  A new page or modal is created to display the permission catalogue.
        2.  The UI fetches the list of permissions and their descriptions from `src/constants/permissions.ts`.
        3.  The list is searchable or filterable to help admins find specific permissions.
    *   **Relative Effort:** S

*   **TS-TEST-01: Create Testing Harness for `authStore` (NEW)**
    *   **Description:** Implement mocking strategies for the `authStore` to simplify unit and E2E testing of permission-gated components.
    *   **Acceptance Criteria:**
        1.  A Vitest mock is created that allows unit tests to preset the `authStore` with specific roles and permissions.
        2.  A Playwright helper function is created that uses `localStorage.setItem('app-auth-storage', ...)` to programmatically log in a user with a specific role before each test run, bypassing the UI login flow.
    *   **Dependencies:** `TS-CLIENT-01`.
    *   **Relative Effort:** M

*   **TS-QA-01: Implement Negative Path E2E Tests**
    *   **Description:** Write end-to-end tests that specifically verify that permission restrictions are enforced correctly for users with limited roles.
    *   **Acceptance Criteria:**
        1.  Using the test harness from `TS-TEST-01`, a Playwright test logs in a user with a `Viewer` role.
        2.  The test asserts that "Create" and "Delete" buttons are disabled or not present in the UI.
        3.  The test attempts to programmatically send an API request for a forbidden action (e.g., `decision_table:create`) and asserts that a `403 Forbidden` error is returned.
    *   **Dependencies:** `TS-TEST-01`.
    *   **Relative Effort:** M

---
### **Epic 6: Operations & Compliance (SEC-OPS-01)**
**Goal:** To implement tooling and processes for long-term auditability, maintenance, and SAMA compliance.

*   **TS-AUDIT-01: Implement Comprehensive Audit Logging**
    *   **Description:** Implement a robust audit trail system to log all critical state changes, access events, and permission-denied events for security and compliance.
    *   **Acceptance Criteria:**
        1.  An `audit_logs` table is created with a schema including: `id`, `uuid`, `timestamp`, `actor_user_id`, `tenant_id`, `action_slug`, `target_resource_uuid`, and a `metadata` JSONB column.
        2.  A shared utility function `createAuditLog(context, eventDetails)` is created to centralize all logging logic.
        3.  This function is integrated into all mutating tRPC procedures and Server Actions.
    *   **Dependencies:** `TS-DB-01`.
    *   **Relative Effort:** M

*   **TS-AUDIT-02: Implement Audit Log Maintenance with Alerting**
    *   **Description:** Create and document a strategy for managing audit log data to meet SAMA's 5-year retention requirement and alert on process failures.
    *   **Acceptance Criteria:**
        1.  Database table partitioning (e.g., by month) is implemented on the `audit_logs` table to manage performance.
        2.  A scheduled job (cron) is created to archive partitions older than a defined "hot" period (e.g., 90 days) to a cold storage solution (e.g., AWS S3 Glacier).
        3.  A monitoring alert (e.g., CloudWatch Alarm) is configured to trigger if the archival job fails.
        4.  The process is documented in the operations runbook.
    *   **Dependencies:** `TS-AUDIT-01`.
    *   **Relative Effort:** L

*   **TS-COMPLIANCE-01: Document and Implement SAMA Compliance Controls**
    *   **Description:** Create the necessary documentation to demonstrate how the implemented framework satisfies specific SAMA control requirements.
    *   **Acceptance Criteria:**
        1.  A compliance matrix document is created that maps specific SAMA controls (e.g., logical access controls, audit trails) to the implemented features (e.g., RLS, `hasPermission` middleware, `audit_logs` table).
        2.  A runbook is written for auditors, explaining how to perform a user access review and how to query the audit logs for specific events.
        3.  The process for periodic user access reviews is formally documented.
    *   **Dependencies:** `TS-AUDIT-02`.
    *   **Relative Effort:** M