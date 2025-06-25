### **Product Requirements Document (PRD): Enterprise-Grade RAG & Knowledge Base Management (v1.0)**

**1. Introduction**

*   **1.1 Purpose and Vision:** To define the requirements to transform the "Experts" module from a basic document upload tool into a production-grade, manageable, and intelligent Retrieval-Augmented Generation (RAG) system. The vision is to empower users with full control and transparency over their knowledge assets, enabling them to build highly accurate and trustworthy "Experts" that can be safely deployed across the platform.

*   **1.2 Background and Context:** The current module operates as a "black box," offering users no control over how their documents are processed and no way to inspect or correct the underlying data. This lack of control and transparency is a critical blocker for any serious enterprise use case, as it makes it impossible to guarantee the accuracy or safety of the RAG system's output.

*   **1.3 Goals and Objectives:**
    *   **Product Goal:** Deliver a best-in-class, enterprise-ready RAG management system that is a key differentiator for the platform.
    *   **User Experience Objectives:** Provide users with full control and transparency over the entire data lifecycle, from ingestion and chunking to curation and testing, making the process intuitive and confidence-inspiring.
    *   **Business Objectives:** Enable serious enterprise use cases by providing the auditability, accuracy, and safety features required by large organizations.

**2. Problem Definition**

*   **2.1 Overview of the Problem:** Users cannot trust or effectively manage the knowledge bases they create. They are unable to fix errors, tailor the ingestion process to their specific content, or safely test an "Expert" before using it in a production workflow.
*   **2.2 Pain Points for Target Users (Data Curators, Subject Matter Experts):**
    *   Inability to correct factual errors or typos in embedded content.
    *   A one-size-fits-all chunking strategy that performs poorly on varied document types.
    *   No safe, sandboxed environment to test and validate a Knowledge Base before deployment.
    *   The "cold start" problem of needing perfect, pre-written documents to begin.

**3. Target Users**

*   **Primary:** Data Curators / Subject Matter Experts responsible for the accuracy of the knowledge.
*   **Secondary:** AI/Workflow Builders who consume the published "Experts" and need to trust their reliability.

**4. Core Product Capabilities**

*   **4.1 Advanced Ingestion & Curation:** User-selectable chunking strategies and a powerful interface for chunk-level data management.
*   **4.2 Structured Lifecycle & Testing:** A formal `Draft` -> `Testing` -> `Published` lifecycle with a sandboxed chat environment for validation.
*   **4.3 AI-Powered Content Creation:** AI assistance for generating initial content and a feedback loop for continuous improvement.
*   **4.4 UI/UX Remediation:** A complete overhaul of the module's UI to fix bugs and align with global design standards.

**5. Scope**

*   **In Scope:** All features outlined in Section 4.
*   **Out of Scope:** Real-time data source connectors (e.g., continuous sync with Notion/Confluence), advanced analytics on query performance and retrieval metrics.

**6. Success Metrics**

*   **Adoption:** >50% of new Knowledge Bases utilize an advanced chunking strategy or the Data Management interface for curation.
*   **Quality:** A significant reduction in user-reported issues related to inaccurate RAG responses.
*   **User Satisfaction:** Positive qualitative feedback specifically mentioning the feelings of "control," "transparency," and "trust" in the system.

***
### **Epics, User Stories & Tasks**

---

### **Epic 1: Advanced Data Ingestion & Granular Curation (EXP-INGEST-01)**

> **Goal:** To give users complete control over how their data is processed and curated, transforming the ingestion pipeline from a black box into a transparent, configurable system.

**User Story 1.1:**
**As a** Data Curator, **I want to** select a chunking strategy before uploading my documents **so that** I can optimize the ingestion process for my specific content type.
*   **Tasks (TS-INGEST-01):**
    *   Design and build a "Chunking Strategy" selector UI in the Knowledge Base creation flow.
    *   Implement the backend logic to accept a strategy parameter (`semantic`, `fixed-length`, etc.) in the document upload tRPC mutation.
    *   Update the asynchronous worker service to include a router that invokes the correct chunking logic based on the selected strategy for each job.

**User Story 1.2:**
**As a** Data Curator, **I want to** view, search, and filter all the individual text chunks in my Knowledge Base **so that** I can easily find and inspect the underlying data.
*   **Tasks (TS-INGEST-02):**
    *   Design the "Data Management" tab UI, including a searchable and filterable table/list view for chunks.
    *   Create a new tRPC query, `knowledgeBase.listChunks`, that returns a paginated list of all chunks for a given KB.
    *   Implement search and filter logic (by source document, by text content) within the tRPC query.
    *   Build the frontend components to render the chunk data and provide the filtering UI.

**User Story 1.3:**
**As a** Data Curator, **I want to** perform actions on individual or multiple chunks (edit, delete, re-embed) **so that** I have fine-grained control over the final knowledge set.
*   **Tasks (TS-INGEST-03):**
    *   **Dependency:** `TS-INGEST-02`.
    *   Implement row-level action buttons (`Edit`, `Delete`) and a bulk-selection mechanism (checkboxes) in the Data Management UI.
    *   Create the `chunk.updateText` tRPC mutation. This will take a chunk ID and new text, then dispatch a targeted async job to re-embed only that chunk.
    *   Create the `chunk.delete` tRPC mutation, which will directly remove the specified chunk's vectors from the vector database.
    *   Implement a "Add Manual Chunk" feature, including the UI and a `chunk.createManual` tRPC mutation that dispatches an embedding job for user-provided text.

---

### **Epic 2: Implement Structured Lifecycle & Sandboxed Testing (EXP-LIFECYCLE-01)**

> **Goal:** To introduce a formal, enterprise-grade lifecycle for all Knowledge Bases, ensuring no "Expert" can be used in production without being explicitly tested and published.

**Technical Story 2.1:**
**As a** System, **I need** to enforce a `Draft` -> `Testing` -> `Published` status lifecycle for every Knowledge Base **so that** asset usage can be strictly controlled.
*   **Tasks (TS-LFC-01):**
    *   Add a `status` enum field to the `KnowledgeBase` schema in the database.
    *   Create tRPC mutations for state transitions: `knowledgeBase.beginTesting` and `knowledgeBase.publish`.
    *   These mutations must be protected by permissions (e.g., only an "Editor" can move to testing, only a "Publisher" can publish).
    *   Update all downstream systems (e.g., the Workflow editor) to only show `Published` Knowledge Bases as available for selection.

**User Story 2.2:**
**As a** Developer, **I want to** test my Knowledge Base in a sandboxed chat environment that shows me the retrieved sources **so that** I can validate its accuracy and debug retrieval issues before publishing.
*   **Tasks (TS-LFC-02):**
    *   **Dependency:** `TS-LFC-01`.
    *   Build the "Test Chat" UI tab within the Knowledge Base detail page.
    *   Refactor the backend chat logic: it must now include the retrieved source chunks (the raw text and source metadata) in its response payload.
    *   The frontend chat UI must be updated to render these sources clearly alongside the AI's final answer, providing full transparency.

---

### **Epic 3: AI-Powered Content Creation & Curation (EXP-AI-01)**

> **Goal:** To leverage AI to dramatically reduce the effort of creating and maintaining a high-quality Knowledge Base.

**User Story 3.1:**
**As a** user facing a new project, **I want to** provide a topic and have AI generate high-quality draft articles **so that** I can overcome the "cold-start" problem and quickly build a foundational knowledge set.
*   **Tasks (TS-AI-GEN-01):**
    *   Design and build the "Generate Content with AI" UI.
    *   Create a `knowledgeBase.generateContent` tRPC mutation that acts as a dispatcher, creating an asynchronous "research" job and adding it to the message queue.
    *   Implement the AI agent logic in the background worker service, equipping it with a web search tool to perform research and generate structured documents.
    *   Update the UI to show the generated articles in a "Draft (AI-Generated)" state, requiring explicit user review and approval before they are sent to the embedding pipeline.

**User Story 3.2:**
**As a** user testing an Expert, **when I** provide corrective feedback in the chat, **I want** the system to intelligently flag the problematic content for review **so that** I can easily help improve the Expert's accuracy.
*   **Tasks (TS-AI-CUR-01):**
    *   Create a new backend procedure for analyzing chat turns for "corrective intent" using an LLM.
    *   This procedure should not edit data directly. Instead, it will create a "Review Suggestion" record in the database, linking the user's feedback to the specific source document and chunk that caused the incorrect answer.
    *   The "Data Management" interface must be updated to visually display these review suggestions, highlighting the problematic chunk and showing the user's feedback to a human curator.

---

### **Epic 4: Comprehensive UI/UX Remediation (EXP-UI-01)**

> **Goal:** To perform a full audit and fix of all identified UI bugs and inconsistencies, bringing the module up to the platform's new quality standard.

**Technical Story 4.1:**
**As a** Developer, **I must** refactor the module to align with the Global Design System and fix all broken functionality.
*   **Tasks (TS-UI-FIX-01): Layout & View Controls**
    *   Refactor the main list page to use the central `<ResourceListView>` component, providing working `Grid`/`List` controls.
    *   Replace all full-page spinners with the standard `<Skeleton>` components.
    *   Standardize the detail page header and use the standard `<Badge>` component for status indicators (`Draft`, `Published`).
*   **Tasks (TS-UI-FIX-02): Core Actions & Functionality**
    *   Implement a functional `Version History` log or remove the broken button.
    *   Replace the oversized `Share` button with the standard subtle icon-button that opens a permissions modal.
    *   Rewire the `Refresh` button to trigger a silent tRPC query refetch.
    *   Rename the `Edit Conversation` action to "Rename Conversation."
    *   Implement the `Clear Conversation` functionality.
    *   Implement or remove the non-functional `Paperclip` icon in the chat input.
*   **Tasks (TS-UI-FIX-03): Workflow & Data Display**
    *   Remove the confusing "Ready" status and replace it with a prominent, standard `Publish` button on the detail page.
    *   Connect the "Activity Log" tab to the central audit service to display real data.
    *   Remove all hard-coded text from placeholders and messages.
    *   Clarify or remove the undefined "small" pill in the chat interface.