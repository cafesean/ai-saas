## **Decision Engine: Final Implementation Plan (v2 with Matrix Lookups)**

### **1. Introduction & Guiding Principles**

This document provides the complete, Jira-ready set of epics and stories required to implement the **Decision Engine** feature. It is structured to be directly translatable into a project management tool.

*   **Architectural Standard:** All tables will use `id BIGSERIAL` for internal joins and a `uuid` for external API exposure, enforced by a single migration.
*   **Security First:** Multi-tenancy is enforced at the database layer with RLS. All API endpoints are protected with RBAC middleware.
*   **Incremental Development:** Foundational work (DB, RBAC) precedes feature work. Large features are broken into smaller, verifiable tasks.
*   **Risk Mitigation:** The plan actively incorporates solutions to previously identified issues like schema mismatches, API inconsistencies, and incomplete dependency setups.

### **2. Foundational Epics (Architectural & Security Prerequisites)**

#### **Epic: DB & Security Foundation (DB-SEC-01)**
**Goal:** To establish a secure, multi-tenant database foundation for all Decision Engine artifacts, fully compliant with platform standards.

*   **Story: Initial Decision Engine Migration (TS-DB-01)**
    *   **Title:** Create and Apply Consolidated Database Migration for Decision Engine
    *   **Description:** As a developer, I need to create a single, comprehensive Drizzle migration that defines all necessary tables for the Decision Engine, ensuring they adhere to the platform's multi-tenancy and primary key standards.
    *   **Acceptance Criteria:**
        1.  A single Drizzle migration file is generated for `variables`, `decision_tables` (and its children), `lookup_tables` (and its new matrix children), `rule_sets`, and `test_scenarios`.
        2.  All new tables use `id BIGSERIAL` as the `PRIMARY KEY` and a `uuid` column (`UNIQUE NOT NULL`) for external exposure.
        3.  All tables include a non-nullable `tenant_id` column for data isolation.
        4.  Core artifact tables include a composite `UNIQUE` index on `(tenant_id, name)` to prevent duplicates.
        5.  The migration applies and reverts cleanly.
        6.  RLS is enabled via migration for all tables containing a `tenant_id`.
        7.  A security policy is created that permits access only when a row's `tenant_id` matches the `app.tenant_id` session variable.
        8.  An automated test confirms that a user from one tenant cannot access data from another.
    *   **Dependencies:** `SEC-MIGRATE-01` (from RBAC epic).
    *   **Relative Effort:** L
    *   **Key Files:** `src/db/schema/variable.ts`, `src/db/schema/decisionTable.ts`, etc., and a new Drizzle migration file.

*   **Story: Implement Row-Level Security (TS-DE-02)**
    *   **Title:** Apply Database Row-Level Security Policies to All Decision Engine Tables
    *   **Description:** As a developer, I need to implement and enable PostgreSQL RLS policies on all multi-tenant tables to create a hard security boundary at the database layer.
    *   **Dependencies:** `TS-DE-01`.
        1.  RLS is enabled via migration for all tables containing a `tenant_id`.
        2.  A security policy is created that permits access only when a row's `tenant_id` matches the `app.tenant_id` session variable.
        3.  An automated test confirms that a user from one tenant cannot access data from another.
    *   **Dependencies:** `TS-DB-01`.
    *   **Relative Effort:** L

#### **Epic: RBAC for Decision Engine (SEC-RBAC-01)**
**Goal:** To secure all Decision Engine endpoints and actions with granular, role-based access control.

*   **Story: Define and Implement Permission Slugs (TS-DE-03)**
    *   **Title:** Define and Implement RBAC Permissions for the Decision Engine
    *   **Description:** As a developer, I need to define all the necessary permission slugs for the Decision Engine and ensure they are checked in the tRPC middleware.
    *   **Dependencies:** `DE-DB-SEC-01`, `SEC-API-01` (from RBAC epic).
    *   **Acceptance Criteria:**
        1.  A constant file (`src/constants/permissions.ts`) is updated with new slugs like `decisioning:variable_create`, `decisioning:table_publish`, etc.
        2.  All new tRPC mutations in the Decision Engine routers are protected by the `hasPermission(...)` middleware using these new slugs.
    *   **Dependencies:** `DB-SEC-01`.

#### **Epic: Quality Assurance for Decision Engine (QA-TEST-01)**
**Goal:** To establish a robust testing strategy that ensures the reliability and correctness of the Decision Engine's complex logic.


*   **Story: Unit & E2E Test Setup (TS-QA-01)**
    *   **Title:** Configure Vitest and Playwright and Implement Initial Tests
    *   **Description:** As a developer, I need to set up the testing frameworks and write initial unit tests for critical logic and a "happy path" E2E test to validate the core user journey.
    *   **Acceptance Criteria:**
        1.  Vitest is configured; unit tests for the n8n code-generation helpers are written and achieve >90% coverage.
        2.  Playwright is configured.
        3.  An E2E test exists that validates the creation, publishing, and successful testing of a simple Decision Table via the Test Console.
    *   **Dependencies:** `US-DE-08` (for the Test Console UI needed by the E2E test).
    *   **Relative Effort:** L


---
### **3. Feature Epics**

#### **Epic: Artifact Management (DE-EPIC-01)**
**Goal:** To build the user-facing library for creating, managing, and versioning all core Decision Engine artifacts.

*   **Story: Manage Variables (US-DE-01)**
    *   **Title:** As a Rule Author, I want to create and manage a library of variables
   *   **Acceptance Criteria:**
        1.  A user can create a Variable, specifying its Name, Data Type, and Logic Type (Direct Map, Formula, Lookup).
        2.  A user can save a Variable as a "Draft," "Publish" it, and later "Deprecate" it.
        3.  The Variable library is searchable and filterable.
    *   **Dependencies:** `DB-SEC-01`, `SEC-RBAC-01`.
     *   **Tasks:**
        *   **Backend (TS-DE-01-BE):** Implement the `variable.router.ts` with full CRUD, publishing, and versioning logic. (Effort: M)
        *   **Frontend (TS-DE-01-FE):** Build the UI at `/decisioning/variables` for listing, creating, and editing Variables. (Effort: M)
        *   **Formula Parser (TS-DE-02):** Implement a secure, sandboxed evaluation engine for "Derived Formula" variables, using a library like `math-expr-eval`. (Effort: M)

*   **Story: Manage Decision Tables (US-DE-02)**
    *   **Title:** As a Rule Author, I want to build and configure multi-condition Decision Tables
    *   **Description:** This story covers the end-to-end functionality for creating complex Decision Tables with multiple inputs and outputs.
    *   **Acceptance Criteria:**
        1.  A user can create a Decision Table, adding inputs by selecting from the published Variables library.
        2.  A user can define output columns.
        3.  The UI provides a spreadsheet-like grid for adding/editing/reordering rules.
        4.  Each rule's conditions can be configured with operators (e.g., `>=`, `∈`).
        5.  A fallback row and per-row descriptions are supported.
    *   **Dependencies:** `US-DE-01`.
    *   **Tasks:**
        *   **Backend (TS-DE-03-BE):** Refactor the existing `decisionTable.router.ts` to be fully transactional and bug-free. (Effort: L)
        *   **Frontend (TS-DE-03-FE):** Refactor the UI at `/decisioning/[slug]` to provide a stable editing experience. (Effort: L)

*   **Story: Manage 1D/2D Matrix Lookup Tables (US-DE-03)**
    *   **Title:** As a Business Analyst, I want to model relationships using a 1D or 2D Matrix Lookup Table
    *   **Description:** Implement a generic visual tool for creating matrix-style lookup tables that determine a single output value based on the intersection of one or two input variables.
    *   **Dependencies:** `US-DE-01`.
    *   **Tasks:**
        *   **Backend - DB Schema (TS-DE-03.1):** As part of `TS-DE-01`, create the new schemas:
            *   `lookup_tables` (stores name, output variable, and up to two input variables).
            *   `lookup_table_dimension_bins` (stores axis definitions: ranges for numeric, exact values for text).
            *   `lookup_table_cells` (stores the output values for each matrix cell).
            (Effort: L)
        *   **Backend - Router (TS-DE-03.2):** Implement `lookupTable.router.ts`. The `create` and `update` mutations must be fully transactional across the three new tables. (Effort: L)
        *   **Frontend - UI (TS-DE-03.3):** Build a dynamic grid editor UI at `/decisioning/lookups/[slug]`. This UI must allow users to define axes (rows and optional columns) based on numeric or categorical variables and edit values directly within the grid cells. (Effort: XL)

*   **Story: Versioning and Rollback (US-DE-04)**
    *   **Title:** As a Senior Analyst, I want to view version history and roll back to a previous version
    *   **Description:** Implement a version history viewer and rollback capability for all artifacts.
    *   **Acceptance Criteria:**
        1.  Every "Publish" action creates a new, immutable version of an artifact.
        2.  The UI displays a version history for each artifact.
        3.  A user can select two versions and see a "diff" of the changes.
        4.  A user can choose a previous version and click "Revert," which creates a new draft identical to that older version.
    *   **Dependencies:** `US-DE-01`, `US-DE-02`, `US-DE-03`.
    *   **Relative Effort:** L

*   **Story: Editor Validation Warnings (US-DE-05)**
    *   **Title:** As a Rule Author, I want to see warnings for incomplete or conflicting rules
    *   **Description:** The Decision Table editor should proactively analyze rules to highlight logical gaps ("Completeness Warning") and overlapping conditions ("Consistency Warning").
    *   **Dependencies:** `US-DE-02`.
    *   **Relative Effort:** L

#### **Epic: Workflow & Node Integration (DE-EPIC-02)**
**Goal:** To make all published Decision Engine artifacts available and functional as nodes within the ReactFlow workflow canvas.

*   **Story: Use Decision Artifacts in Workflows (US-DE-05)**
    *   **Title:** As a Workflow Author, I want to use my artifacts as nodes in a workflow
    *   **Dependencies:** `DE-EPIC-01`.
    *   **Acceptance Criteria:**
        1.  "Decision Table," "Lookup Table," and "Rule Set" appear as options in the "Add Node" palette.
        2.  When a node is added, its properties panel has a dropdown to select a *published* artifact.
        3.  Once an artifact is selected, the node on the canvas visually updates to show the correct input and output ports based on the artifact's schema.
   *   **Tasks:**
        *   **Backend Schema Hydration (TS-DE-05):** In `workflow.router.ts`, implement logic to fetch the schema (inputs/outputs) for each decision node in a workflow and inject it into the `node.data` object returned to the client. In the future, implement message broker to prevent N+1 queries. (Effort: M)
        *   **Backend n8n Code Generation (TS-DE-06):** In `workflow.router.ts`, implement the JavaScript code generation for `Decision Table`, `Lookup Table`, and `Rule Set` nodes. Ensure this logic is covered by the unit tests from `TS-QA-01`. (Effort: L)
        *   **Frontend Node Components (TS-DE-07):** Build the ReactFlow components (`DecisionTableNode.tsx`, etc.) that can dynamically render input/output handles based on the hydrated schema in `node.data`. (Effort: L)


#### **Epic: Advanced Capabilities (DE-EPIC-03)**
**Goal:** To implement orchestration via Rule Sets, a comprehensive testing suite, and robust governance features.

*   **Story: Orchestrate Logic with Rule Sets (US-DE-06)**
    *   **Title:** As a Senior Analyst, I want to chain multiple tables together in a Rule Set
    *   **Description:** Implement the full lifecycle for creating, managing, and executing Rule Sets.
    *   **Acceptance Criteria:**
        1.  A user can create a Rule Set artifact.
        2.  The editor allows adding published Decision/Lookup Tables as ordered steps.
        3.  The UI facilitates mapping inputs of each step to outputs of previous steps or to the main Rule Set inputs.
        4.  A published Rule Set is available as a single node type in the workflow editor.
    *   **Dependencies:** `DE-EPIC-01`.
    *   **Tasks:**
        *   **Backend (TS-DE-08-BE):** Implement the `ruleSet.router.ts` with full CRUD and publishing logic. (Effort: L)
        *   **Frontend (TS-DE-08-FE):** Build the UI at `/decisioning/rulesets` for managing Rule Sets, including a drag-and-drop interface for steps and a UI for variable mapping. (Effort: L)

*   **Story: Test Artifacts in an Interactive Console (US-DE-07)**
    *   **Title:** As a Rule Author, I want an interactive Test Console to validate my logic
    *   **Description:** Build a reusable Test Console that allows for in-memory execution of any Decision Engine artifact, complete with the ability to save and load test scenarios.
    *   **Acceptance Criteria:**
        1.  A "Test" button on each artifact's editor page opens the Test Console dialog.
        2.  The dialog dynamically displays input fields based on the artifact's schema.
        3.  Clicking "Run" executes the logic on the server (without n8n) and displays the output.
        4.  A user can save the current input values as a named "Test Scenario."
        5.  A user can load a previously saved scenario from a dropdown to pre-fill the form.
    *   **Dependencies:** `DE-EPIC-01`.
    *   **Tasks:**
        *   **Backend (TS-DE-09-BE):** Implement `testing.router.ts` with an in-memory `runTest` mutation and `saveScenario`/`getScenarios` procedures that interact with the `test_scenarios` table. (Effort: L)
        *   **Frontend (TS-DE-09-FE):** Build the generic `TestConsoleDialog.tsx` component and integrate it into all artifact editor pages. (Effort: L)

*   **Story: Implement Audit Logging (TS-DE-08)**
    *   **Title:** As a Developer, I need to implement comprehensive audit logging for all critical Decision Engine events.
    *   **Description:** Create and integrate a shared audit logging utility to record key state changes and actions for compliance and troubleshooting.
    *   **Acceptance Criteria:**
        1.  A shared `auditLog(action, entity, ctx)` utility is created.
        2.  Audit logs are generated and stored for the following actions: `PUBLISH`, `DEPRECATE`, `REVERT` of any artifact.
        3.  An audit log is generated for every execution via the Test Console (`TEST_RUN`).
    *   **Dependencies:** `DB-SEC-01`, `DE-EPIC-01`, `US-DE-07`.
    *   **Relative Effort:** M