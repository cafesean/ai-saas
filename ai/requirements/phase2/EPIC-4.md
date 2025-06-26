### **4. Models**

This section details the **new features and architectural enhancements** required to transform the "Models" module from a passive display for pre-built models into a comprehensive, enterprise-grade Model Management and Operations hub. The vision is to support the full lifecycle of a model: from flexible importing and training to robust A/B testing, secure deployment, and transparent monitoring.

---

#### **4.1. Flexible Model Ingestion & Training**

*   **Current State:** The platform can only import models via a rigid JSON structure that breaks easily. The "Build a Model" and "Connect External Models" features are non-functional placeholders.
*   **New Requirement:** Implement a robust and flexible model import process powered by AI, and build out the functionality for connecting to external model providers and initiating training/fine-tuning jobs.
*   **Justification:** Enterprises have diverse model ecosystems. A modern AI platform cannot be a walled garden; it must seamlessly integrate with models from various sources and in various formats. Providing flexible ingestion and pathways for retraining is fundamental to being a central hub for an organization's AI assets.
*   **End-to-End Scenario 1: AI-Powered Flexible Model Import**
    1.  **Initiation:** A data scientist uploads a `model.json` file from their training environment. The file's structure is valid but uses different key names than our internal schema (e.g., `model_performance` instead of `metrics`).
    2.  **AI Transformation Request:** The client calls a tRPC mutation, sending the raw JSON to the backend.
    3.  **Backend AI Translation:** The backend procedure prompts a powerful LLM with both the user's JSON and the platform's target Zod schema. The prompt is direct: "You are a data transformation service. Remap the source JSON object to perfectly validate against this target schema. Intelligently map keys like `model_performance` to `metrics`."
    4.  **Validation and Import:** The backend validates the LLM's restructured output against the Zod schema. If it passes, the model metadata (features, metrics, charts) is saved to the database. The import process is now resilient and user-friendly.
*   **End-to-End Scenario 2: Connecting and Fine-Tuning a Base Model**
    1.  **Connect External LLMs:** A new "Connectors" or "Providers" section in the settings will allow admins to securely input API keys for external services like OpenAI, Anthropic, and Google Gemini.
    2.  **"Build a Model" Redefined:** The "Build a Model" flow is redefined as a "Fine-Tuning Job." A user selects a compatible base model (e.g., a platform-provided Preset Model or a connected external model).
    3.  **Job Configuration:** The user configures the job by selecting a training dataset (e.g., the "Decision Log" from a specific Rule Set) and setting key hyperparameters.
    4.  **Asynchronous Training:** Upon submission, the platform dispatches a fine-tuning job to the asynchronous worker infrastructure. The user can monitor the job's progress from the UI.
    5.  **New Custom Model:** Once the job is complete, a new, fine-tuned custom model artifact appears in the user's Model Hub, ready for testing and deployment.

#### **4.2. Champion/Challenger Framework & Model Groups**

*   **Current State:** Each model exists in isolation. There is no native support for A/B testing or comparing model versions, which is a standard MLOps practice.
*   **New Requirement:** Introduce the concept of "Model Groups," a first-class feature for managing and comparing a "Champion" model against one or more "Challenger" versions in a live production environment.
*   **Justification:** The only way to truly know if a new model is better is to test it on live production data against the current best. A Champion/Challenger framework provides the controlled, measurable, and safe environment needed to validate new models, mitigate risk, and drive continuous performance improvement.
*   **End-to-End Scenario: Running an A/B Test on a New Credit Scoring Model**
    1.  **Group Creation:** A user has a live "Credit Scoring v1.2" (the Champion). They have just created a new "Credit Scoring v1.3" with updated features. They create a new "Model Group" called "Live Credit Scoring."
    2.  **Assigning Roles:** Inside the group's configuration, they designate v1.2 as the "Champion" and v1.3 as the "Challenger." They configure the traffic split, for example, sending 90% of live inference requests to the Champion and 10% to the Challenger.
    3.  **Unified Endpoint:** The Model Group is exposed via a single, stable API endpoint within a workflow. When the workflow calls this endpoint, the platform's internal routing logic handles the 90/10 traffic split automatically.
    4.  **Comparative Analytics:** A new "Comparative View" tab appears within the Model Group's page. This dashboard displays key performance metrics (like accuracy, AUC-ROC, average prediction scores) side-by-side for both the Champion and the Challenger, updated in real-time as live inferences are processed.
    5.  **Promoting a New Champion:** After a week of testing, the analytics clearly show that v1.3 is outperforming v1.2. With a single click on a "Promote to Champion" button, the user designates v1.3 as the new Champion. The system can then automatically re-route 100% of traffic to the new Champion, completing the validation lifecycle without any downtime or API changes.

#### **4.3. Scalable & Auditable Inference Architecture**

*   **Current State:** All inference results from all models are being dumped into a single, massive database table. This is not scalable, makes querying inefficient, and creates a data governance nightmare.
*   **New Requirement:** Redesign the inference storage architecture. Each "Model Group" will have its own dedicated, automatically-generated inference table. Inference logs must be enriched with detailed explainability data.
*   **Justification:** Data isolation is critical for performance and security. Storing related inferences together (e.g., all Champion/Challenger results for one use case) makes analytics dramatically faster and easier. Furthermore, for regulated industries, simply storing the prediction is not enough; we must store the *reason* for the prediction (e.g., feature importance) to ensure full auditability and explainability (XAI).
*   **End-to-End Scenario: Logging an Auditable Inference Request**
    1.  **Table Provisioning:** When a user creates the "Live Credit Scoring" Model Group, the backend automatically provisions a new, dedicated table in the database named `inference_log_live_credit_scoring`.
    2.  **Inference Request:** A workflow sends a request to the Model Group's endpoint with data for a new loan applicant. The request is routed to one of the models (e.g., the Challenger, v1.3).
    3.  **Prediction & Explainability:** The model returns its prediction (e.g., `score: 750`). In the same process, the platform computes and attaches XAI data, such as SHAP values, indicating the feature importance for *this specific prediction* (e.g., `{"income": +0.4, "debt_ratio": -0.2, "age": +0.1}`).
    4.  **Structured Logging:** The system writes a new row to the dedicated `inference_log_live_credit_scoring` table. This row contains not just the input data and the final prediction, but also the model ID that made the prediction (`v1.3`), a request timestamp, and a JSON column containing the full feature importance data.
    5.  **Data Deletion Policy:** If the "Live Credit Scoring" Model Group is ever deleted, the platform will have a clear policy to either delete or archive its associated inference table, ensuring a clean and manageable data lifecycle.

#### **4.4. UI/UX Remediation**

*   **Current State:** The model detail view contains placeholder data, and the user experience for viewing metrics is awkward.
*   **New Requirement:** Connect all UI components to real backend data and streamline the user experience for analyzing model performance.
*   **Justification:** The UI is the window into the model's performance. If it's broken or displays fake data, it undermines the entire purpose of the module and erodes user trust.
*   **Detailed Checklist of Required Fixes & Enhancements:**
    *   **Connect Analytics Tab:** The main analytics tab on the model detail page currently shows placeholder charts and stats. This must be completely rewired to display real, historical performance metrics queried directly from the model's training/validation artifacts stored in the database.
    *   **Integrate Inference View:** The results from the new, dedicated inference tables must be viewable directly within the model detail page, providing an interface to browse, search, and inspect recent live predictions.
    *   **Improve Metrics Display:** The "See all metrics" button, which opens a separate modal, is a poor UX. This modal should be removed. Key performance indicators (KPIs) should be displayed directly on the main analytics page in clear, well-designed cards and charts. More detailed metrics can be organized into collapsible sections or tabs on the same page, eliminating the need for disruptive pop-ups.### **Product Requirements Document (PRD): Enterprise-Grade Decision Engine (v1.0)**

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