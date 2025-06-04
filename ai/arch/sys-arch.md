# System Architecture - AI SaaS Platform

This document outlines the technical architecture of the AI SaaS Platform, serving as a living reference for technical leads, developers, and QA engineers. It synthesizes information from the codebase to provide a comprehensive overview of the system's structure, technologies, and key considerations.

## 1. Core Technologies

The AI SaaS Platform is built upon a modern web development stack designed for performance, scalability, and developer efficiency.

*   **Framework:** Next.js (App Router) - Provides server-side rendering, API routes, and a structured approach to building React applications.
*   **Language:** TypeScript - Ensures type safety and improves code maintainability.
*   **Styling:** Tailwind CSS - A utility-first CSS framework for rapid UI development.
*   **UI Components:** Shadcn UI, Radix UI - Provides pre-built, accessible UI components (e.g., Dialog, DropdownMenu, Card, Table, Select, Tabs, etc.).
*   **Database ORM:** Drizzle ORM - A TypeScript ORM for SQL databases, used for defining schemas and interacting with the database.
*   **Database:** PostgreSQL - A powerful, open-source relational database.
*   **API Layer:** tRPC - Enables end-to-end type-safe API communication between the Next.js frontend and backend.
*   **Authentication:** NextAuth.js - Handles user authentication and session management.
*   **State Management (Client-side):** Zustand - A small, fast, and scalable bearbones state-management solution.
*   **File Storage:** AWS S3 - Used for storing uploaded files such as models, metadata, and knowledge base documents.
*   **Workflow Engine (External):** n8n - An external workflow automation tool integrated for executing complex processes. Workflows are defined in the platform and then synced/run on an n8n instance.
*   **AI Model Serving (External/Internal):** The platform supports connecting to external model APIs and also seems to have infrastructure for serving its own models (suggested by `MODEL_SERVICE_URL` and S3 model file storage).
*   **Vector Database (External/Internal):** PostgreSQL with pgvector is mentioned as a vector DB provider for Knowledge Bases. Other providers like Pinecone, Weaviate, Qdrant, Chroma, Supabase are listed as options.
*   **Messaging/Notification (External):** Twilio - Used for sending messages, likely WhatsApp, based on `TWILIO_API` constants.
*   **AI API (External):** OpenAI API (`OPENAI_API_KEY`) and Google Gemini (`GOOGLE_GEMINI_API_KEY`) are present in environment variables, suggesting integration with these LLMs.

## 2. Project Structure

The project follows a structured organization to enhance modularity and maintainability.
Use code with caution.
Markdown
src/
├── app/ # Next.js App Router (Pages & Layouts)
│ ├── (admin)/ # Admin-facing routes and components
│ │ ├── api-docs/
│ │ ├── content-repo/
│ │ ├── decisioning/
│ │ ├── documents/
│ │ ├── knowledge-bases/
│ │ ├── levels/
│ │ ├── models/
│ │ ├── rules/
│ │ ├── settings/
│ │ ├── templates/
│ │ └── workflows/
│ ├── (auth)/ # Authentication pages (login, register)
│ ├── (widgets)/ # Embeddable widget routes (e.g., chat)
│ ├── api/ # API Route Handlers (Next.js Route Handlers, not tRPC)
│ │ ├── auth/
│ │ ├── callback/
│ │ ├── google/
│ │ ├── inference/
│ │ ├── knowledge-base/
│ │ ├── n8n/
│ │ ├── s3/
│ │ ├── twilio/
│ │ └── upload/
│ ├── demo/ # Demo pages
│ └── layout.tsx # Root layout
│ └── globals.css # Global styles
├── components/ # Shared React Components
│ ├── auth/ # Authentication related UI components
│ ├── form/ # Form specific components (Button, Input, Select etc.)
│ ├── knowledge-bases/ # Components related to knowledge bases
│ ├── models/ # Components related to models (ModelForm, ModelSummary etc.)
│ ├── nodes/ # Custom ReactFlow nodes (AIModelNode, TriggerNode etc.)
│ ├── ui/ # General UI components (Accordion, Avatar, Badge, Card etc.)
│ ├── widgets/ # UI for embeddable widgets
│ └── Sidebar.tsx # Main sidebar navigation
│ └── NavMenu.tsx # Top navigation menu (likely for mobile)
│ └── ThemeToggle.tsx # Dark/Light mode toggle
│ └── ... # Other shared components
├── constants/ # Application-wide constants (routes, API endpoints, general, etc.)
├── db/ # Database related files
│ ├── schema/ # Drizzle ORM schema definitions (model.ts, workflow.ts etc.)
│ │ └── index.ts # Exports all schema modules
│ ├── config.ts # Drizzle DB client configuration
│ ├── default-schema.ts # Appears to be an older or alternative schema structure (pricing related)
│ ├── queries.ts # Pre-defined Drizzle queries (pricing related)
│ └── types.ts # TypeScript types for DB (pricing related)
├── framework/ # Custom hooks, providers, utility functions
│ ├── hooks/ # Custom React hooks (useModalState, useModels, useTableState etc.)
│ ├── lib/ # General utility functions (cn, formatCurrency etc.)
│ ├── providers/ # Context providers (TRPCProvider, ThemeProvider)
│ └── store/ # Zustand store definitions (auth.store, model.store, ui.store)
│ └── types/ # Framework-level TypeScript types
├── lib/ # Core logic, utilities, external API clients (could merge with framework/lib)
│ ├── aws-s3.ts # AWS S3 client and utility functions
│ ├── model-service.ts # Mock model service (should be replaced by tRPC)
│ ├── parser/ # Parsers (e.g., workflow-parser.ts for n8n)
│ └── prisma.ts # Prisma client (potentially unused or for specific part)
│ └── utils.ts # General utility functions (cn)
├── prisma/ # Prisma ORM files
│ └── schema.prisma # Prisma schema definition (seems to be the primary schema now)
├── schemas/ # Zod schemas for validation
│ ├── index.ts
│ └── knowledge-bases.ts
├── server/ # Backend-specific code
│ ├── api/ # tRPC Routers and setup
│ │ ├── root.ts # Root tRPC router
│ │ ├── routers/ # Sub-routers per feature (model.router.ts, workflow.router.ts etc.)
│ │ └── trpc.ts # tRPC procedure builders and context
│ └── auth.ts_ # NextAuth.js configuration (renamed from .ts to .ts_ in prompt)
├── styles/ # Global styles (already in app/globals.css)
├── types/ # Application-specific TypeScript type definitions
└── env.mjs # Environment variable validation (T3 Env)
## 3. Database Design (Primarily Drizzle with PostgreSQL, Prisma also present)

The primary database schema appears to be managed by Drizzle ORM, targeting PostgreSQL. A `prisma/schema.prisma` file also exists, which might be used for other parts of the application or represent an ongoing transition. For this architecture document, we will focus on the Drizzle schema found in `src/db/schema/`.

Key entities include:
*   `models`, `model_metrics`, `inferences`
*   `workflows`, `nodes`, `edges`, `workflow_run_history`
*   `endpoints`, `widgets`
*   `rules`, `rule_flows`, `condition_groups`, `conditions`, `rule_flow_actions`
*   `decision_tables`, `decision_table_rows`, `decision_table_inputs`, `decision_table_outputs`, `decision_table_input_conditions`, `decision_table_output_results`
*   `knowledge_bases`, `knowledge_base_documents`, `conversations`, `conversation_messages`
*   `templates` (for n8n), `node_types` (for n8n)
*   Authentication tables managed by NextAuth.js (implicitly, likely via Prisma adapter if `prisma/schema.prisma` is used for auth).
*   Pricing-related tables (`roles`, `levels`, `rate_cards`, `level_rates`, `pricing_roles`, `pricings`) are defined in `src/db/default-schema.ts` and `src/db/queries.ts`, suggesting a separate or potentially older module for pricing.

*(Refer to `DB.MD` for a detailed schema breakdown based on Drizzle definitions).*

## 4. API Layer (tRPC & Next.js Route Handlers)

The platform utilizes a combination of tRPC for type-safe internal APIs and standard Next.js API Route Handlers for external/webhook integrations.

*   **tRPC:**
    *   **Purpose:** Enables seamless, type-safe communication between the Next.js frontend (admin panel) and backend.
    *   **Core Concepts:**
        *   **Context:** Defined in `src/server/api/trpc.ts`, providing access to the Drizzle DB client.
        *   **Procedures:** API endpoints (queries and mutations) defined in `src/server/api/routers/`. Input validation is likely handled by Zod (common practice with tRPC).
        *   **Routers:** Procedures are organized into routers (e.g., `modelRouter`, `workflowRouter`, `knowledgeBasesRouter`, `decisionTableRouter`). The `appRouter` in `src/server/api/root.ts` merges these.
    *   **Key Routers:**
        *   `dashboard.router.ts`: For dashboard statistics.
        *   `decisionTable.router.ts`: Manages decision tables.
        *   `knowledge-bases.router.ts`: Manages knowledge bases, documents, and conversations.
        *   `model.router.ts`: Handles model CRUD, status updates.
        *   `n8n.ts` (likely for templates/node_types): Manages n8n related entities like templates and node types.
        *   `pricing.router.ts`: Handles pricing configurations.
        *   `rule.router.ts`: Manages business rules.
        *   `template.router.ts`: Potentially for workflow templates (distinct from n8n templates if any).
        *   `widget.router.ts`: Manages embeddable widgets.
        *   `workflow.router.ts`: Manages workflows, nodes, and edges, including conversion to n8n format and interaction with the n8n API.

*   **Next.js API Route Handlers (`src/app/api/`):**
    *   **Purpose:** Used for handling external incoming requests, webhooks, or specific tasks not fitting the tRPC model.
    *   **Examples:**
        *   `/api/upload`: Handles file uploads, likely to S3.
        *   `/api/s3/download`, `/api/s3/delete`: S3 file operations.
        *   `/api/knowledge-base/embedding`, `/api/knowledge-base/chat`: Knowledge base specific API interactions, possibly with an external embedding/chat service.
        *   `/api/inference/[modelId]`: For running model inferences.
        *   `/api/endpoint/[uri]`: Handles custom workflow trigger endpoints, interacting with the n8n backend.
        *   `/api/google/*`: For Google Drive integration.
        *   `/api/twilio/template`: For Twilio integration.
        *   `/api/callback/*`: For handling callbacks from external services.
        *   `/api/admin/node-types/*`: CRUD for n8n node types.

## 5. Authentication (NextAuth.js)

NextAuth.js is used for user authentication and session management.

*   **Purpose:** Securely manages user login, registration, and sessions.
*   **Integration:**
    *   Configuration is in `src/server/auth.ts_`.
    *   Uses JWT strategy for sessions.
    *   Includes a CredentialsProvider for email/password login.
    *   The Prisma schema (`prisma/schema.prisma`) contains NextAuth.js default models (`User`, `Account`, `Session`, `VerificationToken`), suggesting Prisma is used as the adapter for storing authentication data. This contrasts with the Drizzle ORM used for other application data.
    *   Session data is accessible on the server via tRPC context (if integrated) and on the client via `useSession` hook.

## 6. Environment Variables

Environment variables are managed for configuration flexibility.

*   **Management:** Defined in `src/env.mjs` using T3 Env for runtime and build-time validation.
*   **Key Variables:**
    *   `DATABASE_URL`
    *   `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
    *   SMTP credentials (`SMTP_HOST`, `SMTP_PORT`, etc.)
    *   AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME`, `SQS_URL`)
    *   OpenAI API Key (`OPENAI_API_KEY`)
    *   Google API credentials (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_REDIRECT_URI`, `GOOGLE_GEMINI_API_KEY`)
    *   n8n integration details (`N8N_API_URL`, `N8N_API_KEY`, `N8N_BASIC_AUTH_TOKEN`, `N8N_TWILIO_CREDENTIALS_ID`, `N8N_TWILIO_CREDENTIALS_NAME`)
    *   Service URLs (`MODEL_SERVICE_URL`, `KNOWLEDGE_BASE_UPLOAD_URL`, `KNOWLEDGE_BASE_CHAT_URL`, `KNOWLEDGE_BASE_DOCUMENT_CALLBACK_PROCESSED_URL`, `KNOWLEDGE_BASE_EMBEDDING_DELETE_URL`, `INFERENCE_URL`, `TWILIO_SEND_API_URL`)
    *   Application URLs (`NEXT_PUBLIC_AI_SAAS_ENDPOINT_BASE_URL`, `NEXT_PUBLIC_BASE_URL`)
    *   S3 Folder paths (`NEXT_PUBLIC_MODEL_S3_FOLDER`, `NEXT_PUBLIC_KNOWLEDGE_BASE_S3_FOLDER`)
    *   Mock User ID (`NEXT_PUBLIC_MOCK_USER_ID`)

## 7. Core Libraries & Utilities

*   **`src/lib/` & `src/framework/lib/`:** Contain utility functions (e.g., `cn` for Tailwind, `formatCurrency`, `getTimeAgo`, AWS S3 utilities in `aws-s3.ts`, workflow parser in `parser/workflow-parser.ts`).
*   **`src/framework/hooks/`:** Custom React hooks for managing complex state or shared logic (e.g., `useModalState`, `useModels`, `useTableState`, `useViewToggle`).
*   **`src/framework/store/`:** Zustand stores for global client-side state management (e.g., `auth.store.ts`, `model.store.ts`, `ui.store.ts`).
*   **`src/framework/providers/`:** React context providers, notably `TRPCProvider.tsx`.
*   **`src/constants/`:** Application-wide constants for routes, API endpoints, status codes, node types, etc.
*   **`src/schemas/`:** Zod schemas for data validation, used in forms and tRPC procedures.

## 8. Higher-Level Concepts and Design Principles

*   **Type Safety:** Heavily emphasized through TypeScript, Drizzle ORM, tRPC, and Zod, ensuring robust data handling and reducing runtime errors.
*   **Modularity:** The codebase is organized by features (models, workflows, knowledge bases, etc.) and concerns (UI, API, DB, lib).
*   **Component-Based UI:** Utilizes React with Shadcn UI and Radix UI for building a consistent and accessible user interface. Custom components are organized within `src/components/`.
*   **Server-Side Logic:** tRPC routers encapsulate backend business logic, keeping it separate from the frontend.
*   **External Service Integration:** The platform integrates with several external services:
    *   AWS S3 for file storage.
    *   n8n for workflow execution.
    *   Twilio for messaging.
    *   OpenAI and Google Gemini for AI capabilities.
    *   Google Drive for file selection.
*   **Database Schema Management:** Drizzle Kit is likely used for schema migrations (inferred from `package.json` and typical Drizzle usage).
*   **Client-Side State Management:** Zustand is used for managing global client-side state, while tRPC's integration with React Query handles server state and caching.
*   **Separation of ORMs:** The system uses Drizzle ORM for primary application data and appears to use Prisma for authentication-related data via NextAuth.js. This is an unusual setup that might introduce complexity.

## 9. Common Problems to Avoid (General Best Practices)

*   **"Any" Usage:** Minimize `any` in TypeScript. Prefer explicit types.
*   **Client-side Secrets:** Ensure API keys and secrets are only accessed server-side and managed via environment variables.
*   **Direct Database Access from Frontend:** All database interactions for primary application data should go through the tRPC API layer.
*   **Over-fetching/Under-fetching:** Design tRPC procedures to be granular and fetch only necessary data.
*   **Error Handling:** Implement comprehensive error handling in both tRPC procedures and API Route Handlers, and on the client-side.
*   **Large, Monolithic Routers:** Keep tRPC routers focused on specific domains/features.
*   **Business Logic in UI Components:** Abstract business logic into hooks, services, or tRPC procedures.
*   **Inconsistent Naming:** Maintain consistent naming conventions (e.g., `lowercase_snake_case` for DB, `camelCase` for TS/JS).
*   **Input Validation:** Use Zod or similar for validating all inputs to tRPC procedures and API Route Handlers.

## 10. Testing Strategy

No explicit testing framework (like Jest, Vitest, Cypress, or Playwright) setup is evident from the provided `package.json`. A testing strategy should be defined and implemented to ensure code quality and reliability. This would typically involve:
*   Unit tests for utility functions, hooks, and individual tRPC procedures.
*   Integration tests for interactions between components and API layers.
*   End-to-end tests for critical user flows.

This architecture document provides a snapshot of the AI SaaS Platform. It should be updated as the system evolves.