### **Product Requirements Document (PRD): Enterprise-Grade Decision Engine (v1.0)**

**1. Introduction**

*   **1.1 Purpose and Vision:** To define the requirements to transform the "Decision Engine" module from a collection of disconnected tools into a cohesive, powerful, and user-friendly system for creating and deploying complex business logic. The vision is to empower users with a clear, hierarchical framework (**Variables** -> **Tables** -> **Rule Sets**) that is both intuitive for business analysts and robust enough for enterprise-scale decision automation.

*   **1.2 Background and Context:** The current module lacks a coherent architecture. The relationships between its components are not enforced, rule logic is overly simplistic, and the user experience is fragmented and confusing. This prevents it from being used for any meaningful, real-world decisioning tasks and undermines its potential as a core platform feature.

*   **1.3 Goals and Objectives:**
    *   **Product Goal:** Deliver a best-in-class, enterprise-ready rules management system that can model complex business processes and serve as a key differentiator for the platform.
    *   **User Experience Objectives:** Create a highly intuitive and visual experience for building rules, abstracting away technical complexity and enabling business users to confidently create and manage their own logic.
    *   **Business Objectives:** Position the Decision Engine as a powerful onboarding tool for customers who are not yet ready for full AI, providing a clear path to generating auditable decision data that can later be used to train AI models.

**2. Problem Definition**

*   **2.1 Overview of the Problem:** The current system is too simplistic and confusing to model real-world business rules. Users cannot define a clear data contract, express complex conditions, or intuitively orchestrate multi-step decision flows.
*   **2.2 Pain Points for Target Users (Business Analysts, Rules Authors):**
    *   No way to define and reuse a standard set of business terms (Variables).
    *   Inability to create rules with multiple conditions (e.g., `Age between X and Y AND Income > Z`).
    *   The "Rule Set" builder is unusable, requiring knowledge of internal system IDs.
    *   The entire module is plagued by inconsistent UI, broken navigation, and a frustrating user flow.

**3. Target Users**

*   **Primary:** Business Analysts / Rules Authors who are responsible for defining and maintaining business logic.
*   **Secondary:** AI/Workflow Builders who need to integrate these decisioning artifacts into larger automated processes.

**4. Core Product Capabilities**

*   **4.1 Foundational Architecture:** A strictly **Variable-driven**, type-safe framework for all decisioning artifacts.
*   **4.2 Advanced Rule Logic:** Support for complex, multi-condition rules with logical (`AND`/`OR`) grouping.
*   **4.3 Rule Set Orchestration:** A new visual, drag-and-drop editor for building multi-step and parallel decision pipelines.
*   **4.4 UI/UX Remediation:** A complete overhaul of the module's UI to fix all bugs and align with global design standards.

**5. Scope**

*   **In Scope:** All features outlined in Section 4.
*   **Out of Scope:** Direct integration of external data sources within the rule editor, advanced performance simulation/testing of rule sets.

**6. Success Metrics**

*   **Adoption:** >75% of all new Decision Tables are built using the Variable-driven schema flow.
*   **Capability:** >50% of new Rule Sets utilize the new complex logic features (e.g., parallel paths or `OR` condition groups).
*   **User Satisfaction:** A measurable reduction in support tickets and negative feedback related to the Decision Engine's usability.

***
### **Epics, User Stories & Tasks**

---

### **Epic 1: Re-architect for a Variable-Driven, Type-Safe Foundation (DEC-ARCH-01)**

> **Goal:** To rebuild the Decision Engine on a robust, best-practice foundation where a central Variable Library acts as the "data contract" for all decisioning logic.

**User Story 1.1:**
**As a** Rules Author, **I want to** define the inputs and outputs of my Decision Tables by selecting from a central library of Variables **so that** my logic is type-safe, reusable, and uses a standard business vocabulary.
*   **Tasks (TS-ARCH-01):**
    *   Overhaul the "Create/Edit Decision Table" UI to make Variable selection the first and mandatory step for defining the schema.
    *   Build a reusable "Variable Selector" modal component that allows searching and selecting from the `Variables` library.
    *   Implement "on-the-fly" variable creation from within this modal to avoid disrupting the user's workflow.
    *   The backend must now enforce that all Decision Table columns are directly linked to a `Variable` ID, inheriting its name and data type.

**Technical Story 1.2:**
**As a** System, **I must** enforce the uniqueness of Variable names within a tenant **so that** the business vocabulary remains unambiguous and reliable.
*   **Tasks (TS-ARCH-02):**
    *   Add a composite `UNIQUE` constraint on (`tenantId`, `name`) to the `Variables` table schema.
    *   Update the `variable.create` and `variable.update` tRPC mutations to include robust validation and provide clear error messages to the user on conflicts.

---

### **Epic 2: Implement Advanced Rule & Condition Logic (DEC-LOGIC-01)**

> **Goal:** To empower users to model real-world business logic by upgrading the rule engine to support complex, multi-condition rules.

**User Story 2.1:**
**As a** Business Analyst, **I want to** define conditions using a rich set of operators, including ranges (`between`), **so that** I can accurately represent our policies.
*   **Tasks (TS-LOGIC-01):**
    *   Enhance the condition cell UI in the Decision Table editor to present a dropdown of advanced operators based on the column's data type (e.g., `between`, `in list` for numbers; `contains`, `starts with` for strings).
    *   Update the backend rule evaluation engine to correctly process these new operators.

**User Story 2.2:**
**As a** Business Analyst, **I want to** combine multiple conditions with `AND` and `OR` logic **so that** I can build sophisticated, multi-faceted rules.
*   **Tasks (TS-LOGIC-02):**
    *   **Dependency:** `TS-LOGIC-01`.
    *   Implement implicit `AND` logic within each rule row (all conditions in a row must be met).
    *   Design and build a "Condition Grouping" feature in the UI. This will allow users to visually group multiple rule rows together.
    *   The backend evaluation engine must be updated to treat each group as a set of `AND` conditions, with `OR` logic applied between the groups.

---

### **Epic 3: Redesign Rule Sets for Intuitive Orchestration (DEC-ORCH-01)**

> **Goal:** To transform the unusable "Rule Sets" feature into a powerful, visual, drag-and-drop tool for orchestrating complex, multi-step decision pipelines.

**User Story 3.1:**
**As a** Rules Author, **I want to** build a decision flow using a visual, drag-and-drop canvas **so that** I can easily understand and assemble the logic.
*   **Tasks (TS-ORCH-01):**
    *   Design and implement a new visual editor for Rule Sets using a library like React Flow.
    *   The editor must include a palette of available, published artifacts (Decision Tables, Lookup Tables, Formulas) that can be dragged onto the canvas as nodes.

**User Story 3.2:**
**As a** Rules Author, **I want to** model complex flows that include parallel, independent calculations **so that** my decision processes can be more efficient.
*   **Tasks (TS-ORCH-02):**
    *   **Dependency:** `TS-ORCH-01`.
    *   Create a "Parallel Path" node type in the visual editor.
    *   Update the backend execution engine for Rule Sets to support concurrent execution of parallel branches, aggregating the results before proceeding to the next step.

**Technical Story 3.3:**
**As a** System, **I must** create a detailed, auditable log for every Rule Set execution **so that** all decisions are transparent and traceable for compliance and analysis.
*   **Tasks (TS-ORCH-03):**
    *   Design and create a new `DecisionLog` schema in the database. It must store the `ruleSetId`, `version`, all input variables, the final output variables, and a JSON object detailing the outcome of each step in the pipeline.
    *   Integrate logging into the Rule Set execution engine to ensure a log is created for every run.

---

### **Epic 4: Comprehensive UI/UX Remediation (DEC-UI-01)**

> **Goal:** To perform a complete overhaul of the entire Decision Engine UI, fixing all identified bugs and inconsistencies to create a professional and intuitive user experience.

**Technical Story 4.1:**
**As a** Developer, **I must** refactor all module pages to align with the Global Design System and fix all broken functionality and navigation.
*   **Tasks (TS-UI-FIX-01): Navigation & Layout**
    *   Fix the broken `Back` button on the Lookup Table page.
    *   Refactor all list pages (`Variables`, `Decision Tables`, etc.) to use the standard `<ResourceListView>` component, providing consistent views, filters, and skeleton loaders.
    *   Remove the non-standard dashboard cards from the top of module pages in favor of the global dashboard.
*   **Tasks (TS-UI-FIX-02): Interaction Flow & Usability**
    *   Eliminate the unnecessary read-only view on the Lookup Table detail page, taking users directly to the editable view.
    *   Standardize the asset creation flow to use a non-disruptive modal, replacing the current full-page load.
    *   Ensure the "..." action menus are consistent for the same item type across all views.
    *   Fix the misplaced drag-and-drop handle in the Lookup Table editor.
*   **Tasks (TS-UI-FIX-03): Missing Functionality**
    *   Implement the non-functional `Duplicate` and `Export` actions for all relevant artifacts.
    *   Implement a simple versioning and "Change Log" history for all Tables and Rule Sets.
    *   Build a simple, built-in "Test" utility within the Table editors for rapid, ad-hoc validation of logic.