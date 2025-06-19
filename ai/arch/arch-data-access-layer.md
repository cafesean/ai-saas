# Data Access Layer Architecture Standards

**Jira Task:** [SAAS-114: Data Access Layer Architecture](https://jira.jetdevs.com/browse/SAAS-114)  
**Epic:** [SAAS-111: Architecture Documentation](https://jira.jetdevs.com/browse/SAAS-111)  
**Related:** `db-standards.mdc` (detailed coding rules), `coding-standards.md`

## Overview & Purpose

This document defines the current data access layer implementation in the AI SaaS platform. The system uses Drizzle ORM with PostgreSQL, implementing a well-structured schema with proper relationships, migrations, and connection management. This serves as the definitive guide for database interactions and ORM usage patterns.

## Where to Find Logic

### Core Database Configuration
- **Main Database Config:** `src/db/config.ts` - Primary DB connection with schema
- **Alternative Config:** `src/db/db.ts` - Secondary DB connection (schema-less)
- **Main Export:** `src/db/index.ts` - Re-exports `db` from db.ts
- **Schema Organization:** `src/db/schema/index.ts` - Central schema exports and organization

### Schema Definitions
- **RBAC Schema:** `src/db/schema/rbac.ts` - Roles, permissions, user-role mappings
- **Tenant Schema:** `src/db/schema/tenant.ts` - Users, tenants, multi-tenancy
- **Workflow Schema:** `src/db/schema/workflow.ts` - Workflows, nodes, edges
- **Model Schema:** `src/db/schema/model.ts` - AI models, metrics, inferences
- **Decision Engine:** `src/db/schema/decision_table.ts`, `lookup_table.ts`, `rule.ts`, `variable.ts`
- **Knowledge Base:** `src/db/schema/knowledge_base.ts` - RAG system schema
- **Audit Schema:** `src/db/schema/audit.ts` - Audit logging

### Migration System
- **Drizzle Migrations:** `drizzle/` directory - SQL migrations and meta
- **Generated Schema:** `drizzle/schema.ts` - Auto-generated from TypeScript schema
- **RLS Policies:** `drizzle/rls-policies.sql` - Row-level security policies

### Query Patterns & Usage
- **tRPC Integration:** `src/server/api/trpc.ts` - Database context injection
- **Router Examples:** `src/server/api/routers/*.ts` - Query and mutation patterns
- **Type Definitions:** `src/framework/types/*.ts` - TypeScript types from schema

## Current Architecture Patterns

### 1. Database Connection Setup
```typescript
// Current pattern from config.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(connectionString, {
  max: 10,                      // Connection pool size
  idle_timeout: 20,             // Close idle connections after 20s
  max_lifetime: 60 * 30,        // Close connections after 30min
  connect_timeout: 30,          // Connection timeout
  prepare: false,               // Disable prepared statements
  transform: { undefined: null }, // Transform undefined to null
});

export const db = drizzle(client, { schema });
```

### 2. Schema Definition Patterns
```typescript
// Standard table definition pattern from rbac.ts
export const roles = pgTable(
  "roles",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    isSystemRole: boolean("is_system_role").default(false).notNull(),
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
    index("roles_id_idx").on(table.id),
    uniqueIndex("roles_uuid_idx").on(table.uuid),
    uniqueIndex("roles_name_idx").on(table.name),
  ],
);
```

### 3. Relations Definition
```typescript
// Relations pattern from schema files
export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [userRoles.tenantId],
    references: [tenants.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));
```

### 4. Query Patterns in tRPC
```typescript
// Standard query pattern from routers
export const userRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
        with: {
          userRoles: {
            with: {
              role: true,
              tenant: true,
            },
          },
        },
      });
      
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      
      return user;
    }),

  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const [newUser] = await ctx.db
        .insert(users)
        .values(input)
        .returning();
      
      return newUser;
    }),
});
```

## Schema Organization & Standards

### Naming Conventions ✅
Following established patterns from `ai/arch/db.md`:
- **Tables:** Plural nouns (`users`, `workflows`, `decision_tables`)
- **Columns:** Snake_case (`created_at`, `is_active`, `user_id`)
- **Primary Keys:** `id` (serial) or `uuid` (UUID primary keys)
- **Foreign Keys:** `referencing_table_singular_id` (`user_id`, `tenant_id`)
- **Indexes:** `ix_table_column` pattern with descriptive names

### Data Types Used ✅
```typescript
// Timestamp handling (compliant with standards)
timestamp("created_at", {
  withTimezone: true,    // Always use timestamptz
  mode: "date",         // JavaScript Date objects
}).defaultNow().notNull()

// Text vs VARCHAR
text("description")                    // Variable length text
varchar("name", { length: 100 })     // Fixed max length when needed

// JSON storage
json("workflow_json")                 // Semi-structured data

// UUIDs and serials
serial("id").primaryKey()             // Auto-incrementing PK
uuid("uuid").defaultRandom()          // UUID generation
```

### Multi-Tenancy Implementation ✅
```typescript
// Tenant-scoped tables include tenant_id
export const userRoles = pgTable("user_roles", {
  userId: integer("user_id").notNull().references(() => users.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  roleId: integer("role_id").notNull().references(() => roles.id),
  // ... other fields
}, (table) => [
  primaryKey({ columns: [table.userId, table.tenantId, table.roleId] }),
]);
```

## Templates & Usage Examples

### 1. Creating New Schema File
```typescript
// Template for new schema file
import {
  pgTable,
  serial,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const yourTable = pgTable(
  "your_table",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
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
    index("your_table_id_idx").on(table.id),
    uniqueIndex("your_table_uuid_idx").on(table.uuid),
    index("your_table_name_idx").on(table.name),
  ],
);

export const yourTableRelations = relations(yourTable, ({ many, one }) => ({
  // Define relationships here
}));
```

## Anti-Patterns & Common Mistakes

### ❌ Database Anti-Patterns
1. **Raw SQL Injection** - Always use Drizzle's query builders
2. **Missing Indexes** - Index all foreign keys and frequently queried columns
3. **No Transaction Usage** - Use transactions for multi-table operations
4. **Ignoring Connection Pooling** - Current config properly handles pooling

### ❌ Schema Anti-Patterns
1. **Missing Timestamps** - Always include `created_at` and `updated_at`
2. **No UUID Fields** - Include UUID for external references
3. **Missing Soft Deletes** - Consider `deleted_at` for important data
4. **Poor Naming** - Follow established naming conventions

## Architecture Issues Found

### ✅ Critical Issues - RESOLVED

1. **Inconsistent Database Imports** - ✅ **COMPLETED**
   ```typescript
   // OLD PATTERNS (inconsistent):
   import { db } from '@/db/config';     // Some files
   import { db } from '@/db';            // Other files
   import { db } from '@/db/db';         // Direct import

   // NEW STANDARD (consistent):
   import { db } from '@/db';            // All files now use this
   ```
   - **Status:** ✅ All 30+ files standardized to use `import { db } from '@/db';`
   - **Impact:** Eliminated DB instance confusion, single source of truth
   - **Files Updated:** All router files, API routes, and library files

2. **Duplicate Database Configuration** - ✅ **COMPLETED**
   - **Files:** `src/db/config.ts` vs `src/db/db.ts` (db.ts deleted)
   - **Status:** ✅ Consolidated to single configuration in `config.ts`
   - **Impact:** Zero maintenance overhead, no more inconsistencies
   - **Solution:** `src/db/index.ts` exports from `config.ts`

### ✅ Medium Priority Issues - COMPLETED

1. **Missing Type Safety in Some Routers** - ✅ **COMPLETED**
   ```typescript
   // OLD PATTERN (less type-safe):
   import schema, { someTable } from "@/db/schema";
   // Usage: schema.tableName

   // NEW PATTERN (better type safety):
   import { workflows, nodes, edges, endpoints } from "@/db/schema";
   // Usage: workflows, nodes, etc.
   ```
   - **Status:** ✅ Updated major router files (workflow, knowledge-bases, etc.)
   - **Impact:** Better type safety, clearer dependencies, enhanced IDE support
   - **Files Updated:** All major router files and API routes

2. **Inconsistent Error Handling** - ⚠️ **READY FOR IMPLEMENTATION**
   - **Pattern:** Some queries don't handle `NOT_FOUND` cases
   - **Status:** 📋 Documented patterns, ready for standardization
   - **Solution:** Standardize error handling patterns across codebase

## Database Standards Compliance

### ✅ Following Standards
Based on review against `ai/arch/db.md`:

1. **Naming Conventions:** ✅ All tables use `lowercase_snake_case`, plural nouns
2. **Data Types:** ✅ Proper use of `timestamptz`, `text`, `varchar` with lengths
3. **Primary Keys:** ✅ Every table has `id` primary key
4. **Foreign Keys:** ✅ Proper FK definitions with cascade behavior
5. **Indexing:** ✅ Appropriate indexes on PKs, FKs, and query columns
6. **Constraints:** ✅ NOT NULL, UNIQUE, and FK constraints properly defined
7. **Audit Columns:** ✅ `created_at` and `updated_at` on all tables

## Changelog

### v1.1.0 - Data Access Layer Standardization (Completed)
- ✅ **Database Import Standardization**: All 30+ files now use `import { db } from '@/db';`
- ✅ **Configuration Consolidation**: Removed duplicate `db.ts`, single source in `config.ts`
- ✅ **Type Safety Enhancement**: Major router files converted to named schema imports
- ✅ **Build Verification**: All changes validated with successful production build
- ✅ **Zero Breaking Changes**: All existing functionality preserved

### v1.0.0 - Foundation Implementation
- ✅ Drizzle ORM integration with PostgreSQL
- ✅ Comprehensive schema definitions for all domains
- ✅ Proper relationships and foreign key constraints
- ✅ Multi-tenancy support with tenant_id patterns
- ✅ RBAC schema with roles, permissions, and mappings
- ✅ Migration system with Drizzle Kit
- ✅ Connection pooling and performance optimization

### Next Version (Planned)
- 🔄 Enhanced error handling standards implementation
- 🔄 Add query performance monitoring
- 🔄 Implement soft delete patterns
- 🔄 Consider splitting oversized routers (workflow.router.ts: 1047 lines) 