Excellent. Using the provided templates and the detailed architectural vision we've established, here is the complete project breakdown for **Section 1.0: Foundational Architecture & Cross-Cutting Concerns**.

This document translates our high-level strategy into a structured, actionable engineering plan, starting with the PRD and then drilling down into a sequence of Epics, User Stories, and Tasks.

***

### **Product Requirements Document (PRD): Foundational Platform Architecture (v1.0)**

**1. Introduction**

*   **1.1 Purpose and Vision:** To define the foundational engineering requirements needed to transform the AI SaaS platform from a collection of prototypes into a secure, scalable, and enterprise-ready application. The vision is to establish a cohesive architecture where all modules are built upon a common, robust, and intelligent foundation, enabling rapid future development and ensuring a high-quality user experience.

*   **1.2 Background and Context:** The current platform, while functionally promising, suffers from core architectural deficiencies. Long-running tasks block the UI, security between organizations is not enforced, the user experience is inconsistent, and the lack of shared services slows down development. This initiative addresses these fundamental problems head-on.

*   **1.3 Goals and Objectives:**
    *   **Product Goal:** Deliver a stable, secure, and performant platform foundation that can be trusted by enterprise customers and serves as a launching pad for all future feature development.
    *   **User Experience Objectives:** Create a seamless, responsive, and predictable interface that feels professional, intuitive, and eliminates user friction caused by bugs and inconsistencies.
    *   **Business Objectives:** Increase development velocity by at least 30% for new features built atop this foundation. Achieve a state of "enterprise-readiness" to unblock sales conversations with larger, security-conscious clients.

**2. Problem Definition**

*   **2.1 Overview of the Problem:** The lack of a unified architecture creates a poor user experience, introduces security risks, and cripples development speed.
*   **2.2 Pain Points for Target Users:**
    *   **Developers/Builders:** Face a frustrating experience with a slow, buggy UI. Lack of component reusability means they "reinvent the wheel" for each feature.
    *   **Team Leads/Managers:** Cannot effectively organize projects or collaborate securely due to the absence of a "Workspace" concept.
    *   **Platform Administrators/Security Officers:** Cannot trust the platform due to unenforced multi-tenancy and the risk of data leakage between organizations.

**3. Target Users**

*   **Primary:** Internal Development Teams (who will build upon this foundation).
*   **Secondary:** All end-users (Administrators, Team Leads, Analysts) who will benefit from the resulting stability, security, and improved user experience.

**4. Core Product Capabilities**

This initiative will deliver five foundational architectural pillars:
*   **4.1 Workspace Core:** A top-level container for organizing projects, assets, and collaboration.
*   **4.2 Asynchronous Job System:** A platform-wide system for reliably processing all long-running tasks in the background.
*   **4.3 Multi-Tenancy & Session Core:** A complete overhaul of how users, organizations, and permissions are managed securely.
*   **4.4 Global Design System & UI Kit:** A unified library of reusable UI components and standards.
*   **4.5 AI-Assistance Framework:** The foundational backend services to enable AI-powered "helper" features throughout the platform.

**5. Scope**

*   **In Scope:** The implementation of the five Core Capabilities outlined above.
*   **Out of Scope:** Specific feature implementations within the Models, Experts, or Decisioning modules (those will be built *on top of* this foundation).

**6. Success Metrics**

*   **Performance:** A 50% reduction in average page load times and the elimination of all synchronous, UI-blocking operations longer than 500ms.
*   **Stability:** A 75% decrease in UI/UX-related bug reports.
*   **Security:** Successful completion of a multi-tenancy penetration test with zero critical data leakage vulnerabilities.
*   **Velocity:** All new UI-facing features built after this initiative must demonstrate 100% adoption of the new Global Design System components.

***
### **Epics, User Stories & Tasks**

---

### **Epic 1: Implement "Workspaces" as the Core Organizational Unit (ARC-WORKSPACE-01)**

> **Goal:** To introduce a top-level container for organizing all project-related assets, enabling collaboration and a structured development-to-deployment lifecycle.

**User Story 1.1:**
**As a** Team Lead, **I want to** create a new, named Workspace **so that** I can establish a dedicated, isolated environment for a new project.
*   **Tasks (TS-WS-01):**
    *   Design the "Create Workspace" modal UI.
    *   Create the `Workspace` schema in the database (including `id`, `uuid`, `name`, `orgId`, `createdAt`).
    *   Build the frontend component for the creation modal.
    *   Implement the `workspace.create` tRPC mutation with input validation.
    *   Ensure the creator is automatically assigned as an "Admin" of the new Workspace.

**User Story 1.2:**
**As a** Developer, **I want to** view and manage all my assets (e.g., Models, Experts) within the context of the currently selected Workspace **so that** my work remains organized and isolated from other projects.
*   **Tasks (TS-WS-02):**
    *   **Dependency:** `TS-WS-01`.
    *   Add a `workspaceId` foreign key to all relevant asset schemas (`Model`, `KnowledgeBase`, `DecisionTable`, etc.).
    *   Refactor all asset creation tRPC mutations to require a `workspaceId`.
    *   Update all asset list tRPC queries to filter by the active `workspaceId`.
    *   Implement a global "Workspace Selector" dropdown component in the main UI header.

**User Story 1.3:**
**As a** Team Lead, **I want to** invite other users from my organization to a Workspace and assign them roles (e.g., Admin, Editor, Viewer) **so that** we can collaborate securely on the project.
*   **Tasks (TS-WS-03):**
    *   **Dependency:** `TS-WS-01`.
    *   Design the "Manage Members" UI within a Workspace's settings.
    *   Create the `WorkspaceMember` join table schema (`workspaceId`, `userId`, `role`).
    *   Implement tRPC mutations for inviting, removing, and changing the roles of members.
    *   Integrate workspace roles into the platform's global RBAC middleware.

---

### **Epic 2: Establish a Platform-Wide Asynchronous Job Processing System (ARC-ASYNC-01)**

> **Goal:** To handle all long-running tasks (document embedding, model imports, etc.) in the background, ensuring the UI remains responsive and the platform is scalable.

**Technical Story 2.1:**
**As a** System, **I need** core infrastructure for queueing and tracking background jobs **so that** I can reliably offload long-running tasks from the main application thread.
*   **Tasks (TS-ASYNC-01):**
    *   Architect and provision the message queue infrastructure (e.g., AWS SQS or similar).
    *   Create a standard `Job` schema in the database to track job status (`pending`, `processing`, `complete`, `failed`), type, payload, and user ID.
    *   Refactor a single tRPC mutation (e.g., `knowledgeBase.uploadDocument`) as the first implementation: it should only create a `Job` record and push a message to the queue, then return a `jobId` immediately.

**Technical Story 2.2:**
**As a** System, **I need** a scalable, independent worker service **to** reliably process jobs from the message queue.
*   **Tasks (TS-ASYNC-02):**
    *   **Dependency:** `TS-ASYNC-01`.
    *   Develop a separate worker service (e.g., a serverless AWS Lambda function).
    *   Implement the core processing logic for the first job type: document chunking and embedding.
    *   Implement robust error handling and a retry mechanism within the worker.
    *   Ensure the worker updates the `Job` status in the database upon completion or failure.

**User Story 2.3:**
**As a** user, **I want to** see the real-time status of my background jobs in the UI **so that** I have visibility into the progress of my tasks.
*   **Tasks (TS-ASYNC-03):**
    *   **Dependency:** `TS-ASYNC-02`.
    *   Set up a WebSocket server to handle tRPC subscriptions.
    *   Create a tRPC subscription `onJobStatusChange(jobId)` that a client can subscribe to.
    *   The worker service, upon updating a job's status, must trigger an event (e.g., via Redis Pub/Sub).
    *   The eventing system will push the status update to the WebSocket server, which then notifies the subscribed client.
    *   The frontend UI will use this subscription to dynamically update status indicators.

---

### **Epic 3: Overhaul Multi-Tenancy & Session Management (ARC-SESSION-01)**

> **Goal:** To fix critical security flaws and implement a robust, enterprise-grade system for managing users, organizations, and sessions.

**User Story 3.1:**
**As a** user who belongs to multiple organizations, **I want to** switch between them seamlessly **so that** my view and context are immediately and completely isolated to the selected organization.
*   **Tasks (TS-SESSION-01):**
    *   Fix the session hydration logic to load all of a user's organizations and roles on login.
    *   Implement a tRPC middleware that intercepts every request, validates the active `orgId` from the client against the user's session, and throws an `UNAUTHORIZED` error on mismatch.
    *   Ensure all database queries are strictly scoped using the validated `orgId`.
    *   Refactor the frontend state management (Zustand) to correctly handle the `activeOrgId` and trigger data re-fetches upon switching.

**User Story 3.2:**
**As a** user, **when** an admin changes my permissions, **I want** my UI and access rights to update in real-time **so that** security policies are enforced instantly without me needing to log out.
*   **Tasks (TS-SESSION-02):**
    *   **Dependency:** Requires a WebSocket server from `TS-ASYNC-03`.
    *   Implement a tRPC subscription (`onPermissionsChange`) for real-time permission updates.
    *   When an admin updates a user's role, the backend must publish a "permission changed" event.
    *   The WebSocket server pushes this event to the targeted user's client.
    *   The client, upon receiving the event, automatically re-fetches its permissions and updates its local state, causing the UI to re-render with the correct access rights.

**User Story 3.3:**
**As a** user, **I want** the application to remember my UI preferences (like list vs. grid view) across sessions **so that** I have a consistent and personalized experience.
*   **Tasks (TS-SESSION-03):**
    *   Create a `UserPreference` schema in the database to store a JSON object of UI settings.
    *   Implement a debounced tRPC mutation (`user.updatePreferences`) that the frontend calls after a UI setting is changed.
    *   Update the session hydration logic to fetch and send these preferences to the client on login.
    *   Configure the frontend state (Zustand) to initialize with these server-provided settings and persist to local storage for instant re-loads.

---

### **Epic 4: Develop and Implement a Global UI/UX Design System (ARC-DESIGN-01)**

> **Goal:** To create a single source of truth for all UI components, ensuring a consistent, professional, and high-quality user experience across the entire platform.

**Technical Story 4.1:**
**As a** Developer, **I need** a centralized library of core, state-aware UI components **so that** I can build features faster and ensure they are visually and functionally consistent.
*   **Tasks (TS-DESIGN-01):**
    *   Set up the foundational structure for the component library (e.g., using Storybook for development and documentation).
    *   Develop the first set of core components: `<Button>`, `<Modal>`, `<DropdownMenu>`, `<Input>`, `<Tooltip>`, `<Badge>`.
    *   Ensure components like `<Button>` can automatically handle `loading` and `disabled` states.
    *   Document the props and usage for each component in Storybook.

**User Story 4.2:**
**As a** user, **I want** to see consistent and non-disruptive loading states (skeleton loaders) **so that** the application feels fast and modern.
*   **Tasks (TS-DESIGN-02):**
    *   **Dependency:** `TS-DESIGN-01`.
    *   Create a generic `<Skeleton>` component.
    *   Develop specific skeleton components for major UI layouts (e.g., `<ResourceListSkeleton>`).
    *   Refactor all data-fetching pages and components to use their corresponding skeleton component while the tRPC query `isLoading`.

**User Story 4.3:**
**As a** user, **I want** all list pages to have a consistent set of controls **so that** I can interact with the platform in a predictable way.
*   **Tasks (TS-DESIGN-03):**
    *   **Dependency:** `TS-DESIGN-01`.
    *   Develop the generic `<ResourceListView>` component that encapsulates logic for grid/list toggling, filtering, and pagination.
    *   Refactor the Models, Experts, and Decisioning list pages to use this new, standardized component.

---

### **Epic 5: Integrate Foundational AI-Powered Assistance Framework (ARC-AI-01)**

> **Goal:** To build the core backend infrastructure that will enable AI-powered "helper" features throughout the platform.

**Technical Story 5.1:**
**As a** Developer, **I need** a standardized, secure service for calling a large language model (LLM) from a tRPC procedure **so that** I can easily and safely add AI assistance to my feature.
*   **Tasks (TS-AI-01):**
    *   Create a centralized AI service/module in the backend.
    *   This service will manage API keys (from a secure secret manager) and provide a standard interface for different LLM providers (e.g., OpenAI, Anthropic).
    *   Implement a core function like `llm.generateStructuredOutput(prompt, zodSchema)` that takes a prompt and a Zod schema, calls the LLM, and automatically validates/parses the response.

**Technical Story 5.2:**
**As a** System, **I need** a reliable method to get structured JSON from an LLM **so that** I can power features like generating rules from an Excel file.
*   **Tasks (TS-AI-02):**
    *   **Dependency:** `TS-AI-01`.
    *   Develop a standard prompting strategy that combines a role, a task, the user's data, and a stringified Zod schema to constrain the output.
    *   Implement robust error handling and retry logic for when the LLM response fails Zod validation.
    *   Integrate this structured generation capability into the AI service as the primary method for most AI-assist features.