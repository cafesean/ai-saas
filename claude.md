# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Workflow
```bash
# Start development server
pnpm dev

# Production build with strict validation
pnpm build:strict

# Linting and code quality
pnpm lint

# Testing
pnpm test              # Unit tests with Vitest
pnpm test:coverage     # Test coverage reports  
pnpm test:e2e          # End-to-end tests with Playwright
pnpm test:e2e:ui       # E2E tests with UI

# Database and permissions
pnpm migrate:permissions    # Seed RBAC permissions
pnpm verify:permissions     # Validate permission setup
```

### Package Management
- **Always use `pnpm`** for package management (specified in .cursorrules)
- Engine requirement: Node.js >= 18.17.0

## System Architecture Overview

### Technology Foundation
This is a **Next.js 15.1.1 AI SaaS platform** with:
- **Frontend**: React 19, TypeScript, App Router
- **Backend**: tRPC v11 for type-safe APIs  
- **Database**: PostgreSQL with Drizzle ORM v0.39.3
- **Authentication**: NextAuth.js with comprehensive RBAC
- **UI**: Tailwind CSS + Radix UI + Shadcn components
- **State**: Zustand + TanStack React Query (via tRPC)
- **Testing**: Vitest + Playwright

### Recent Major Migration (tenant → org)
The codebase recently completed a significant architectural migration from "tenant" to "org" terminology:

```typescript
// New JSONB-based approach in users table
orgData: jsonb("org_data").default('{"currentOrgId": null, "orgs": []}')
```

**Benefits:**
- Single query user-org relationships
- Atomic org switching
- Better session caching with embedded context
- Scalable metadata extension

### Multi-Domain Schema Architecture

The database schema follows domain-driven design with 17+ schema files:

```
Core Multi-tenancy:  org.ts, rbac.ts
AI Platform:         model.ts, workflow.ts, knowledge_base.ts  
Decision Engine:     decision_table.ts, rule.ts, rule_set.ts, variable.ts
System:              audit.ts, endpoint.ts, widget.ts
```

### Advanced tRPC Patterns

The API layer implements sophisticated patterns:

```typescript
// Permission-based procedures
export const withPermission = (requiredPermission: string) => {
  return protectedProcedure.use(({ ctx, next }) => {
    // Permission checking with admin fallback
    const hasPermission = userPermissions.includes(requiredPermission) ||
                         userPermissions.includes('admin:full_access');
  });
};

// Rate limiting middleware  
export const withRateLimit = (procedure?: string) => {
  return protectedProcedure.use(async ({ ctx, next, path }) => {
    await checkTRPCRateLimit(session.user.id, procedure || path);
  });
};
```

**Key Router Files:**
- `src/server/api/trpc.ts` - Core tRPC setup with context
- `src/server/api/root.ts` - Combined router exports
- `src/server/api/routers/` - 20+ feature-specific routers

### Database Architecture Patterns

**Connection Management:**
```typescript
// Production-ready PostgreSQL setup in src/db/config.ts
const client = postgres(DATABASE_URL, {
  max: 10,                      // Connection pool
  idle_timeout: 20,             // Close idle after 20s
  max_lifetime: 60 * 30,        // Close after 30min
  prepare: false,               // Serverless compatibility
  transform: { undefined: null }, // Handle undefined
});
```

**Schema Patterns:**
- All tables use `serial("id")` primary keys
- Standard `created_at`/`updated_at` timestamps with timezone
- Comprehensive indexing strategy
- Foreign keys with proper cascading rules

### Security Implementation

**Production-Ready Features:**
- CVE-2025-29927 mitigation in middleware
- Comprehensive CSP headers with environment awareness
- Rate limiting with Upstash Redis
- HSTS, CORS, and security headers
- Session security (24-hour max age)

### Component Architecture

**UI System:**
- 40+ atomic UI components in `src/components/ui/`
- Form components with React Hook Form + Zod validation
- Design system with CSS custom properties
- Responsive mobile-first approach
- Class-variance-authority for component variants

**Key Patterns:**
```typescript
// Standard form pattern
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

## External Integrations

### Service Ecosystem
- **Workflow Engine**: n8n integration for automation
- **AI Services**: OpenAI API, Google Gemini
- **File Storage**: AWS S3 with CDN delivery
- **Communication**: Twilio (WhatsApp, SMS)
- **Search**: Vector databases (pgvector)

### Integration Pattern
```typescript
// Standard service client pattern
export class ExternalService {
  private client: ServiceClient;
  
  constructor() {
    this.client = new ServiceClient({
      // Environment-based configuration
    });
  }
  
  async performAction(params: ActionParams): Promise<ActionResult> {
    // Implementation with proper error handling
  }
}
```

## Development Standards & Patterns

### Code Quality Rules (from .cursorrules)
- **Systematic Approach**: Think step-by-step, don't jump to conclusions
- **Existing Patterns**: Always use established design and coding patterns  
- **DRY Principle**: Follow religiously when writing and refactoring
- **Lessons Learning**: Document fixes and corrections in scratchpad files

### TypeScript Standards (from .cursor/rules/)
- Functional and declarative programming (avoid classes)
- Descriptive variable names with auxiliary verbs (`isLoading`, `hasError`)
- Minimize `'use client'`, `useEffect`, `setState` - favor RSC and SSR
- Early returns for error conditions with guard clauses
- Custom error types for consistent handling

### Database Standards (from .cursor/rules/db-standards.mdc)
- `lowercase_snake_case` for all identifiers
- Plural table names (e.g., `users`, `workflows`, `models`)
- Primary keys named `id` (serial) or `uuid` (UUID)
- Foreign keys: `referencing_table_singular_id` format
- Always use `timestamptz` for date/time storage
- Index all foreign key columns
- Explicit constraint naming conventions

## Current Development State

### Recently Completed ✅
1. **Tenant-to-Org Migration**: Complete database schema transformation
2. **Security Hardening**: NextAuth.js with proper session management
3. **Middleware Security**: CVE mitigations and comprehensive headers
4. **RBAC Enhancement**: Advanced permission-based procedures

### Active Areas 🔄
1. **Component Standardization**: Consolidating multiple button implementations
2. **Router Optimization**: Refactoring large workflow router
3. **Testing Expansion**: E2E coverage for auth and permissions
4. **Performance Monitoring**: APM integration planning

### Architecture Strengths 💪
- End-to-end TypeScript type safety
- Production-ready security and authentication
- JSONB-optimized multi-tenancy
- Comprehensive error handling
- Modern UI/UX patterns
- Scalable external service integration

## File Structure Insights

### Key Configuration Files
- `drizzle.config.ts` - Database migration configuration
- `next.config.js` - Next.js build and runtime configuration
- `tailwind.config.js` - Design system configuration  
- `tsconfig.json` - TypeScript compiler configuration
- `middleware.ts` - Request middleware with security headers

### Important Directories
- `src/server/api/routers/` - tRPC API endpoints (20+ routers)
- `src/db/schema/` - Database schema definitions (17+ files)
- `src/components/ui/` - Atomic UI component library (40+ components)
- `src/app/` - Next.js App Router pages and layouts
- `ai/` - AI-related documentation and code samples
- `drizzle/` - Database migrations and metadata

### Development Guidelines
- Check existing patterns before implementing new features
- Use established tRPC procedures (`withPermission`, `protectedProcedure`)
- Follow domain-driven schema organization
- Ensure proper org-level isolation in database queries
- Implement comprehensive error handling with TRPCError
- Add appropriate rate limiting for mutations

This codebase represents a mature, production-ready AI SaaS platform with excellent architectural foundations and clear patterns for scalable development.

# Jira tool use and instructions
## Project Keys
Always find the default project key from .env using JIRA_PROJECT_KEY.

## Getting Jira Issues
If the user's message does NOT contain a specific project AND a specific Jira Server, ask the USER to provide this information before using the tool. Always set the project key to uppercase when sending to the MCP server.
- Always include the Issue Key with url link to issue, summary, status, epic link, and sprint.
- The URL structure should be like: https://base_url/browse/{project_key}-{number}

## Creating Jira Issues
The project key MUST be certain. The project key is usually less 10 characters and will ONLY consist of alpha-numeric characters, never any special characters of punctuation.
- If no assignee is mentioned, assign the issue to unassigned
- Do NOT add any quotation marks within a JQL statement
- Creating Epics: to create an epic, be sure to include the Epic Name as shown here: {
  "additional_fields": {
    "Epic Name": "{epic_name}"
  }
}
- When creating stories, always set "Epic Link" to the correct Epic's issue key. If an Epic doesn't exist, ask the user to create one first, or ask to link to a Default epic (which you should create if it doesn't exist already).
- If multiple issues need to be created, use the batch create tool. If one of the issues to be created is an epic, create that issue first so that it can be linkable by other issues.

## Updating Jira Issues
- Jira is the single source of truth for task status. Use the Jira MCP Server for all status transitions.
- Key statues you will interact with or that will be set by other roles include:
  - `Open` / `To Do`: Task is ready to be picked up.
  - `In Progress`: Task is actively being worked on by a developer.
  - `Ready for Review`: Development is complete, code is pushed, PR is created, and task is awaiting Tech Lead code review.
  - `Ready for QA`: Tech Lead has reviewed and approved the code, PR merged, and task is awaiting QA.
  - `In QA`: QA is actively testing the task.
  - `Resolved`: QA has passed the task. It may await User Acceptance Testing (UAT).
  - `Failed QA` / `Reopened`: QA found issues, or UAT failed. Task needs rework. Bugs should be logged as separate, linked Jira issues.
  - `Closed` / `Done`: UAT passed (if applicable), and the task is considered fully complete.
- If multiple issues need to be updated, use the batch update tool.
- Always ensure your actions (e.g., creating a PR) are completed BEFORE updating the Jira status to reflect that state (e.g., `Ready for Review`).
- Add informative comments to Jira tasks when updating status, especially providing PR links or summarizing test results.

## Creating sprints
- The start and end dates must be in the future.
- The date format should be YYYY-MM-DDTHH:MM:SS+ZZZZ, where +ZZZZ is the time zone offset.
- To add issues to the sprint, use the jira_update_issue tool and set the Sprint field in additional_fields to the sprint ID (as a number).
- Sprint field requires a numerical value for the sprint ID, not a string.

## Claude AI Issue Creation Guidelines
- **Issue Creation Policy**: 
  - Only create new issues based on epic documents, or if I request it specifically. Do not create new issues for your own tasks

- **Jira Issue Creation & Linking - Operational Guide**
  Issue Hierarchy Best Practices
  - Epic: True business capability that delivers complete user value
  - Story: Feature/component that contributes to Epic completion
  - Task: Specific implementation work that completes a Story
  - Avoid creating "epics" that are really just features - consolidate into fewer, larger Epics
  Linking Strategy (in order of effectiveness)
  1. Epic Links: Use Epic Link field for Stories → Epic relationships
  2. Issue Links: Use Parent link type for formal parent-child relationships (Tasks → Stories)
  3. Parent Field: Limited effectiveness, use Issue Links instead
  Technical Implementation Process
  1. Create Epic first - establishes the container for all work
  2. Create Stories - link to Epic using Epic Link field in additional_fields
  3. Create Tasks - initially without parent links
  4. Create formal links - use jira_create_issue_link with link_type: "Parent"
    - inward_issue_key: child task
    - outward_issue_key: parent story

  Validation Requirements
  - Always verify linking worked - check actual Jira UI, don't trust API success responses
  - Test with one story first before applying to all stories
  - Use proper link types available in the Jira instance (check with jira_get_link_types)
  Content Standards
  - Consistent templates: Parent Story, Task Goal, Implementation Details, Acceptance Criteria, Technical
  Requirements
  - Clear references: Include parent issue keys in descriptions
  - Actionable detail: Enough specificity to implement, not so much it becomes a spec
  - No prefixes: Don't add "Task:" or "TS-001:" to summaries
  Common Pitfalls to Avoid
  - Don't use batch operations for complex linking - individual operations are more reliable
  - Don't assume linking worked without verification
  - Don't create Sub-task issue types unless the Jira instance specifically supports them
  - Don't change issue types after creation - may not be supported
  Memory for Future Use
  When user requests Jira issue creation from epic documents:
  1. Analyze epic structure first - consolidate into proper Epic → Story → Task hierarchy
  2. Create issues individually with proper Epic Links
  3. Use Issue Links with "Parent" type for formal parent-child relationships
  4. Always verify one story's linking before proceeding with all stories
  5. Only create issues based on epic documents or explicit user requests