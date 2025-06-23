import {
  pgTable,
  serial,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table with embedded org relationships (SAAS-140)
export const users = pgTable(
  "users",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    username: varchar("username", { length: 255 }),
    password: text("password"),
    avatar: text("avatar"),
    phone: varchar("phone", { length: 50 }),
    isActive: boolean("is_active").default(true).notNull(),
    // JSONB field to store user-org relationships and metadata
    // Structure: { currentOrgId: number, orgs: [{ orgId: number, role: string, isActive: boolean, joinedAt: string }] }
    orgData: jsonb("org_data").default('{"currentOrgId": null, "orgs": []}'),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("users_v2_id_idx").on(table.id),
    uniqueIndex("users_v2_uuid_idx").on(table.uuid),
    uniqueIndex("users_v2_email_idx").on(table.email),
    // GIN index for JSONB queries on org data
    index("users_v2_org_data_gin_idx").using("gin", table.orgData),
  ],
);

// Organizations table (renamed from orgs - SAAS-140)
export const orgs = pgTable(
  "orgs",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 255 }).unique(),
    logoUrl: text("logo_url"),
    website: text("website"),
    businessAddress: text("business_address"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("orgs_id_idx").on(table.id),
    uniqueIndex("orgs_uuid_idx").on(table.uuid),
    uniqueIndex("orgs_slug_idx").on(table.slug),
  ],
);

// Legacy user-org relationship table (will be deprecated after migration - SAAS-140)
// This table will be removed once all user-org data is migrated to users.orgData JSONB field
export const userOrgs = pgTable(
  "user_orgs",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orgId: integer("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 100 }).notNull(), // Will be moved to JSONB
    isActive: boolean("is_active").default(true).notNull(), // Will be moved to JSONB
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("user_orgs_user_id_idx").on(table.userId),
    index("user_orgs_org_id_idx").on(table.orgId),
    // Composite unique constraint
    uniqueIndex("user_orgs_user_org_unique").on(table.userId, table.orgId),
  ],
);

// Relations - Simplified with JSONB approach
export const usersRelations = relations(users, ({ many }) => ({
  // Legacy relation - will be removed after migration
  userOrgs: many(userOrgs),
}));

export const orgsRelations = relations(orgs, ({ many }) => ({
  // Legacy relation - will be removed after migration  
  userOrgs: many(userOrgs),
}));

// Legacy relations - will be removed after migration to JSONB
export const userOrgsRelations = relations(userOrgs, ({ one }) => ({
  user: one(users, {
    fields: [userOrgs.userId],
    references: [users.id],
  }),
  org: one(orgs, {
    fields: [userOrgs.orgId],
    references: [orgs.id],
  }),
}));

// Legacy exports for backward compatibility during migration
// export const orgs;
// export const userOrgs;
// export const orgsRelations;
// export const userOrgsRelations; 