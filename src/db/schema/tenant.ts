import {
  pgTable,
  serial,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
  foreignKey,
  primaryKey,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// New clean users table (SAAS-31)
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
    index("users_id_idx").on(table.id),
    uniqueIndex("users_uuid_idx").on(table.uuid),
    uniqueIndex("users_email_idx").on(table.email),
  ],
);

// New tenants table (SAAS-31)
export const tenants = pgTable(
  "tenants",
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
    index("tenants_id_idx").on(table.id),
    uniqueIndex("tenants_uuid_idx").on(table.uuid),
    uniqueIndex("tenants_slug_idx").on(table.slug),
  ],
);

// User-tenant relationship table (SAAS-31)
export const userTenants = pgTable(
  "user_tenants",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 100 }).notNull(), // Temporary field for initial mapping
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
    primaryKey({ columns: [table.userId, table.tenantId] }),
    index("user_tenants_user_id_idx").on(table.userId),
    index("user_tenants_tenant_id_idx").on(table.tenantId),
  ],
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userTenants: many(userTenants),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  userTenants: many(userTenants),
}));

export const userTenantsRelations = relations(userTenants, ({ one }) => ({
  user: one(users, {
    fields: [userTenants.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [userTenants.tenantId],
    references: [tenants.id],
  }),
})); 