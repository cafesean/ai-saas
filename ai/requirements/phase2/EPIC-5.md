### **Product Requirements Document (PRD): Configurable & Permission-Aware Dashboard (v1.0)**

**1. Introduction**

*   **1.1 Purpose and Vision:** To define the requirements to transform the platform's static dashboard into a dynamic, user-configurable, and permission-aware command center. The vision is to empower users, from system administrators to business analysts, with a personalized, high-level view of the platform's operational health, business performance, and key metrics that are most relevant to their roles.

*   **1.2 Background and Context:** The current dashboard is a hard-coded, one-size-fits-all landing page. It fails to provide targeted insights for different user roles and cannot be extended or customized. This represents a significant missed opportunity to deliver immediate value and operational visibility to our users upon login.

*   **1.3 Goals and Objectives:**
    *   **Product Goal:** Deliver a flexible, widget-based dashboard system that serves as a powerful command center for all user personas.
    *   **User Experience Objectives:** Create an intuitive "edit mode" that allows authorized users to easily build and customize their dashboards via drag-and-drop, making data visualization accessible and engaging.
    *   **Business Objectives:** Increase user engagement and perceived platform value by providing immediate, relevant, and actionable insights on the primary landing page.

**2. Problem Definition**

*   **2.1 Overview of the Problem:** The static dashboard provides little value to most users as it cannot be tailored to their specific needs. An administrator needs to see system health, while a risk manager needs to see model performance. The current dashboard serves neither well.
*   **2.2 Pain Points for Target Users:**
    *   **Administrators:** Lack a centralized view of system-wide operational metrics like inference volume or API health.
    *   **Business Managers / Analysts:** Cannot create a tailored view of key business metrics (e.g., rule execution rates, model A/B test performance) relevant to their specific projects.
    *   **All Users:** Are presented with generic, often irrelevant information, diminishing the value of the main landing page.

**3. Target Users**

*   **Primary (as Configurers):** Platform Administrators and Team Leads who will build and assign dashboards.
*   **Primary (as Consumers):** All users of the platform who will view the dashboards tailored for their roles.

**4. Core Product Capabilities**

*   **4.1 Configurable Widget-Based System:** A grid-based dashboard with a drag-and-drop "edit mode" and a library of pre-built widgets.
*   **4.2 Permission-Aware Rendering:** A security model ensuring that widgets only display data that the viewing user is authorized to access.
*   **4.3 Rich Widget Library:** A comprehensive initial set of widgets providing insights into all major platform modules.

**5. Scope**

*   **In Scope:** All features outlined in Section 4. The initial library will focus on core metrics for Models, Decisioning, and Experts.
*   **Out of Scope:** User-created custom widgets (i.e., users writing their own code/queries for a widget). All widgets will be pre-built by the platform team.

**6. Success Metrics**

*   **Adoption:** >50% of admin-level users have created at least one custom dashboard layout within the first month of release.
*   **Engagement:** A measurable increase in average session duration for users who land on a configured dashboard versus a default one.
*   **Value Proposition:** "Customizable Dashboards" becomes a frequently mentioned positive feature in user feedback and sales conversations.

***
### **Epics, User Stories & Tasks**

---

### **Epic 1: Implement a Configurable, Widget-Based Dashboard Architecture (DASH-ARCH-01)**

> **Goal:** To re-architect the dashboard from a static page into a fully configurable, grid-based system powered by a library of reusable "Widgets."

**User Story 1.1:**
**As an** Administrator, **I want to** enter an "edit mode" for the dashboard **so that** I can customize its layout and content.
*   **Tasks (TS-ARCH-01):**
    *   Design and build the dashboard's "edit mode" toggle and state management.
    *   Implement a responsive grid layout system (e.g., using a library like `react-grid-layout`) that supports dragging, resizing, and repositioning of items.
    *   Create the database schema to store dashboard layouts as a JSON object (including widget positions, sizes, and configurations).
    *   Implement the `dashboardLayout.save` tRPC mutation.

**User Story 1.2:**
**As an** Administrator, **I want to** add, remove, and configure widgets from a library **so that** I can build a dashboard with the specific information I need.
*   **Tasks (TS-ARCH-02):**
    *   **Dependency:** `TS-ARCH-01`.
    *   Design and build the "Widget Library" UI, which will appear as a sidebar or modal in edit mode.
    *   Architect the "Widget" component structure. Each widget will be a self-contained component responsible for its own data fetching and rendering.
    *   Implement the client-side logic for adding a widget from the library to the grid and removing it.
    *   Implement a configuration flow (e.g., a modal opened by a gear icon on the widget) for widgets that require user input (e.g., selecting a specific Model Group to display).

---

### **Epic 2: Ensure Permission-Aware Widget Rendering (DASH-SEC-01)**

> **Goal:** To enforce the platform's global RBAC system at the widget level, ensuring a user can never see data on a dashboard that they are not authorized to access.

**Technical Story 2.1:**
**As a** System, **I must** check a user's permissions before rendering any widget's data **so that** I prevent any potential data leakage.
*   **Tasks (TS-SEC-01):**
    *   Modify the generic widget component wrapper to be fundamentally permission-aware.
    *   Each widget's definition must declare the permission slug required to view its data (e.g., `models:read`).
    *   Before a widget attempts to fetch its data, this wrapper will first check the user's permissions from the global `authStore`.
    *   If the user lacks the required permission, the data fetching call (tRPC query) will be skipped entirely.

**User Story 2.2:**
**As a** user with limited permissions, **when I** view a dashboard, **I want** to see a clear and safe representation of content I cannot access **so that** the layout remains consistent but secure.
*   **Tasks (TS-SEC-02):**
    *   **Dependency:** `TS-SEC-01`.
    *   Design and build a standardized "Access Denied" state for widgets.
    *   When the permission check in the widget wrapper fails, the widget will render this standardized state instead of its data view. This state will display a message like "You do not have permission to view this widget."

---

### **Epic 3: Develop a Rich Library of Core Widgets (DASH-WIDGETS-01)**

> **Goal:** To create a comprehensive initial set of pre-built widgets that provide immediate, actionable insights into all major platform modules.

**Technical Story 3.1:**
**As a** Developer, **I need to** build a set of widgets for the "Models" module.
*   **Tasks (TS-WIDGET-01):**
    *   **KPI Card Widget:** Build a widget to display "Total Inferences Processed" over a selectable time range.
    *   **Chart Widget:** Build a "Champion vs. Challenger Performance" widget that displays a line chart comparing a key metric over time. This widget must be configurable to select the Model Group.
    *   **List Widget:** Build a "Top 5 Most Active Models" widget, ranked by inference count.
    *   **Feed Widget:** Build a "Recent Inference Log" widget showing a live-updating feed of the last few predictions.

**Technical Story 3.2:**
**As a** Developer, **I need to** build a set of widgets for the "Decision Engine" module.
*   **Tasks (TS-WIDGET-02):**
    *   **KPI Card Widget:** Build a widget to display "Total Rule Executions" over a selectable time range.
    *   **List Widget:** Build a "Top 10 Most Executed Rule Sets" widget.
    *   **Chart Widget:** Build a "Decision Outcome Distribution" widget that renders a pie chart of outcomes (e.g., Approve/Reject/Review).

**Technical Story 3.3:**
**As a** Developer, **I need to** build a set of widgets for the "Experts" and "System" modules.
*   **Tasks (TS-WIDGET-03):**
    *   **Experts Widget:** Build a "Most Queried Experts" list widget, ranked by chat interaction count.
    *   **System Widget:** Build a "System Audit Log" feed widget showing recent high-priority events.
    *   **System Widget:** Build an "Active Asynchronous Jobs" list widget, showing the status of currently running background jobs.