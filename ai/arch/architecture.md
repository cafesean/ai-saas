# System Architecture - AI SaaS Platform

**Document Type:** Complete Architecture Reference  
**Audience:** Technical Leadership, Developers, System Architects  
**Purpose:** Comprehensive guide to system design, components, and implementation patterns

## Table of Contents

1. [System Overview](#system-overview)
2. [Authentication & Security](#authentication--security)
3. [API Layer (tRPC)](#api-layer-trpc)
4. [Data Access Layer](#data-access-layer)
5. [UI/UX Architecture](#uiux-architecture)
6. [External Integrations](#external-integrations)
7. [Performance & Scalability](#performance--scalability)

---

## System Overview

### Technology Stack
- **Frontend:** Next.js 14+ (App Router), React, TypeScript
- **Backend:** Next.js API Routes, tRPC
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** NextAuth.js with RBAC
- **UI Framework:** Tailwind CSS, Radix UI, Shadcn UI
- **State Management:** Zustand + React Query (via tRPC)
- **File Storage:** AWS S3
- **External Services:** n8n, OpenAI, Google APIs, Twilio

### Architecture Principles
1. **Type Safety First** - End-to-end TypeScript with runtime validation
2. **Separation of Concerns** - Clear boundaries between layers
3. **Security by Design** - RBAC, input validation, secure sessions
4. **Scalable Organization** - Feature-based architecture
5. **Developer Experience** - Consistent patterns, comprehensive tooling

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│                 │    │                 │    │                 │
│ • Next.js Pages │◄──►│ • tRPC Routers  │◄──►│ • PostgreSQL    │
│ • React UI      │    │ • API Routes    │    │ • Drizzle ORM   │
│ • Zustand Store │    │ • NextAuth.js   │    │ • Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ External APIs   │    │ File Storage    │    │ Workflow Engine │
│ • OpenAI        │    │ • AWS S3        │    │ • n8n           │
│ • Google APIs   │    │ • File Upload   │    │ • Integrations  │
│ • Twilio        │    │ • CDN Delivery  │    │ • Automation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Authentication & Security

### NextAuth.js Implementation

**Core Files:**
- `src/server/auth.ts` - NextAuth configuration
- `src/middleware.ts` - Authentication middleware
- `src/app/api/auth/` - NextAuth API routes

### Authentication Flow
```typescript
// NextAuth configuration pattern
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      authorize: async (credentials) => {
        // Credential validation logic
        return user || null;
      }
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: { ...session.user, id: token.id }
    })
  }
};
```

### RBAC System

**Schema Structure:**
```typescript
// Core RBAC tables
users ─┐
       ├─ userRoles ─┐
       │             ├─ roles ─ rolePermissions ─ permissions
       └─ tenants ───┘

// Multi-tenant isolation
userRoles: { userId, tenantId, roleId }
```

**Permission Checking:**
```typescript
// Server-side permission validation
const hasPermission = async (userId: number, permission: string, tenantId: number) => {
  const userPerms = await db.query.userRoles.findMany({
    where: and(
      eq(userRoles.userId, userId),
      eq(userRoles.tenantId, tenantId)
    ),
    with: {
      role: {
        with: { rolePermissions: { with: { permission: true } } }
      }
    }
  });
  
  return userPerms.some(ur => 
    ur.role.rolePermissions.some(rp => 
      rp.permission.name === permission
    )
  );
};
```

## API Layer (tRPC)

### Architecture Overview

**Core Files:**
- `src/server/api/trpc.ts` - tRPC configuration and context
- `src/server/api/root.ts` - Root router combining all sub-routers
- `src/server/api/routers/` - Feature-specific routers (20+ files)

### tRPC Context Setup
```typescript
// Database and session context
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const session = await getServerSession(opts.req, opts.res, authOptions);
  
  return {
    db,
    session,
    req: opts.req,
    res: opts.res,
  };
};

// Protected procedure with auth validation
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});
```

### Router Organization Patterns

**Well-Structured Examples:**
```typescript
// user.router.ts - Good patterns
export const userRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return user;
    }),

  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(users).values(input).returning();
    }),
});
```

### Architecture Issues Identified ⚠️

1. **CRITICAL:** `workflow.router.ts` - 1047 lines, needs refactoring
2. **HIGH:** Hardcoded tenant IDs in multiple routers:
   - `tenant.router.ts` - line 15: `tenantId: 1`
   - `model.router.ts` - line 89: `tenantId: 1` 
   - `widget.router.ts` - line 25: `tenantId: 1`
3. **MEDIUM:** Inconsistent error handling patterns
4. **MEDIUM:** Inconsistent naming conventions across routers

---

## Data Access Layer

### Database Architecture

**Technology:** PostgreSQL + Drizzle ORM + Connection Pooling

**Core Files:**
- `src/db/config.ts` - Primary database configuration
- `src/db/db.ts` - Alternative configuration ⚠️ **Potential duplication**
- `src/db/schema/` - Schema definitions (18+ files)
- `drizzle/` - Migration system

### Connection Management
```typescript
// Production-ready connection setup
const client = postgres(DATABASE_URL, {
  max: 10,                      // Connection pool size
  idle_timeout: 20,             // Close idle connections after 20s
  max_lifetime: 60 * 30,        // Close connections after 30min
  connect_timeout: 30,          // Connection timeout
  prepare: false,               // Disable prepared statements for serverless
  transform: { undefined: null }, // Transform undefined to null
});

export const db = drizzle(client, { schema });
```

### Schema Organization

**Core Domains:**
```typescript
// Multi-tenant user management
src/db/schema/tenant.ts     - users, tenants, multi-tenancy
src/db/schema/rbac.ts       - roles, permissions, user-role mappings

// AI Platform Features  
src/db/schema/model.ts      - AI models, metrics, inferences
src/db/schema/workflow.ts   - workflows, nodes, edges
src/db/schema/knowledge_base.ts - RAG system, documents, conversations

// Decision Engine
src/db/schema/decision_table.ts - decision tables and matrices
src/db/schema/rule.ts       - business rules and logic
src/db/schema/variable.ts   - system variables
src/db/schema/lookup_table.ts - reference data

// System
src/db/schema/audit.ts      - audit logging
src/db/schema/endpoint.ts   - API configurations
src/db/schema/widget.ts     - embeddable widgets
```

### Schema Patterns
```typescript
// Standard table definition
export const users = pgTable(
  "users",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    }).defaultNow().notNull(),
  },
  (table) => [
    index("users_id_idx").on(table.id),
    uniqueIndex("users_uuid_idx").on(table.uuid),
    uniqueIndex("users_email_idx").on(table.email),
  ],
);

// Relations definition
export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  createdModels: many(models),
}));
```

### Database Issues Identified ⚠️

1. **MEDIUM:** Duplicate database config files (`config.ts` vs `db.ts`)
2. **MEDIUM:** Inconsistent import patterns (`@/db/config` vs `@/db` vs `@/db/db`)
3. **LOW:** Missing indexes on some foreign key columns

---

## UI/UX Architecture

### Design System Foundation

**Core Technologies:** Tailwind CSS + Radix UI + React Hook Form

**Design Files:**
- `src/app/globals.css` - Design tokens, CSS variables
- `tailwind.config.js` - Theme configuration  
- `src/components/ui/` - Atomic UI components (40+ components)
- `src/components/form/` - Form-specific components

### Design Token System
```css
/* Color system with dark mode support */
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --success: 142.1 76.2% 36.3%;
  --muted: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  --destructive: 0 62.8% 30.6%;
}
```

### Component Variant System
```typescript
// Using class-variance-authority for consistent variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-transparent hover:bg-accent",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
      },
    }
  }
);
```

### Responsive Design Patterns
```typescript
// Mobile-first responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive flex layouts  
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

// Responsive navigation
<TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-none md:flex">
```

### Form Architecture
```typescript
// Standardized form pattern with validation
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name *</FormLabel>
          <FormControl>
            <Input placeholder="Enter name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### UI Issues Identified ⚠️

1. **MEDIUM:** Multiple button implementations (`ui/button.tsx`, `form/Button.tsx`, `ui/sample-button.tsx`)
2. **MEDIUM:** Inconsistent component import paths
3. **LOW:** Some components missing accessibility features

---

## External Integrations

### Service Architecture
```
AI SaaS Platform
├── n8n (Workflow Execution)
│   ├── Workflow sync and execution
│   ├── Custom node types
│   └── API integration
├── AWS S3 (File Storage)
│   ├── Model file storage
│   ├── Knowledge base documents
│   └── CDN delivery
├── AI Services
│   ├── OpenAI API (GPT models)
│   ├── Google Gemini API
│   └── Custom model serving
├── Communication
│   ├── Twilio (WhatsApp, SMS)
│   └── Email (SMTP)
└── Third-Party APIs
    ├── Google Drive integration
    └── Vector databases (pgvector, Pinecone, etc.)
```

### Integration Patterns
```typescript
// External service client pattern
export class S3Service {
  private s3Client: S3Client;
  
  constructor() {
    this.s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  
  async uploadFile(key: string, body: Buffer): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
      Body: body,
    });
    
    await this.s3Client.send(command);
    return `https://${env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  }
}
```

---

## Performance & Scalability

### Frontend Optimizations
- **Server Components:** Reduced client-side JavaScript bundle
- **Code Splitting:** Dynamic imports for feature modules
- **Image Optimization:** Next.js Image component with WebP
- **Caching:** React Query integration via tRPC

### Backend Optimizations  
- **Connection Pooling:** PostgreSQL connection management
- **Query Optimization:** Drizzle ORM with proper relations
- **Type Safety:** End-to-end TypeScript validation
- **Error Handling:** Comprehensive error boundaries

### Database Performance
- **Indexing:** Strategic indexes on query patterns
- **Relations:** Efficient join patterns via Drizzle
- **Migrations:** Versioned schema evolution
- **Multi-tenancy:** Row-level security for data isolation

### Monitoring & Observability
- **Error Tracking:** Application error monitoring needed
- **Performance:** API response time monitoring needed  
- **Security:** Authentication and access pattern monitoring needed

---

## Architecture Decisions & Trade-offs

### Technology Choices

1. **Drizzle vs Prisma:** Chose Drizzle for better TypeScript integration and performance
2. **tRPC vs REST:** tRPC provides end-to-end type safety but requires TypeScript
3. **NextAuth.js:** Comprehensive auth solution but adds complexity
4. **Tailwind CSS:** Utility-first approach enables rapid development

### Current Technical Debt

1. **Authentication Middleware:** Disabled, needs immediate attention
2. **Router Size:** Workflow router too large, needs refactoring  
3. **Hardcoded Values:** Tenant IDs and other constants need configuration
4. **Database Config:** Duplicate configurations need consolidation
5. **Component Library:** Multiple implementations need standardization

### Future Improvements

1. **Testing Strategy:** Implement comprehensive test coverage
2. **Performance Monitoring:** Add APM and error tracking
3. **API Documentation:** Auto-generate from tRPC schemas
4. **Component Documentation:** Create Storybook for UI components
5. **Security Hardening:** Enable middleware, audit permissions

---

## Conclusion

The AI SaaS Platform implements a modern, type-safe architecture with strong foundations in Next.js, tRPC, and PostgreSQL. While the core architecture is solid, several critical security and maintainability issues need immediate attention.

**Immediate Priorities:**
1. 🔴 Enable authentication middleware *DONE*
2. 🔴 Remove hardcoded tenant IDs *DONE*
3. 🟡 Refactor oversized workflow router *DONE*
4. 🟡 Consolidate database configurations *DONE*
5. 🟡 Standardize component implementations *DONE*

**Key Strengths:**
- Type-safe end-to-end architecture
- Comprehensive RBAC system
- Well-structured database schema
- Modern UI/UX framework
- Scalable external service integration

This architecture provides a strong foundation for building a secure, scalable AI SaaS platform while maintaining developer productivity and code quality. 