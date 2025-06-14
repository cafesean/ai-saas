import {
  pgTable,
  serial,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./tenant";
import { tenants } from "./tenant";

// Roles table - defines system roles
export const roles = pgTable(
  "roles",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    isSystemRole: boolean("is_system_role").default(false).notNull(), // Built-in roles vs custom roles
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
    index("roles_id_idx").on(table.id),
    uniqueIndex("roles_uuid_idx").on(table.uuid),
    uniqueIndex("roles_name_idx").on(table.name),
  ],
);

// Permissions table - defines all available permissions in the system
export const permissions = pgTable(
  "permissions",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    slug: varchar("slug", { length: 100 }).notNull().unique(), // e.g., "decision_table:create", "workflow:publish"
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 50 }), // e.g., "workflow", "decision_table", "model"
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
    index("permissions_id_idx").on(table.id),
    uniqueIndex("permissions_uuid_idx").on(table.uuid),
    uniqueIndex("permissions_slug_idx").on(table.slug),
    index("permissions_category_idx").on(table.category),
  ],
);

// Role-Permission mapping table - defines which permissions each role has
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    index("role_permissions_role_id_idx").on(table.roleId),
    index("role_permissions_permission_id_idx").on(table.permissionId),
  ],
);

// User-Role assignments table - defines which roles users have within specific tenants
export const userRoles = pgTable(
  "user_roles",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true).notNull(),
    assignedAt: timestamp("assigned_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    assignedBy: integer("assigned_by").references(() => users.id), // User who assigned the role
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
    // Composite unique constraint to prevent duplicate role assignments
    primaryKey({ columns: [table.userId, table.tenantId, table.roleId] }),
    index("user_roles_user_id_idx").on(table.userId),
    index("user_roles_tenant_id_idx").on(table.tenantId),
    index("user_roles_role_id_idx").on(table.roleId),
    index("user_roles_assigned_by_idx").on(table.assignedBy),
  ],
);

// Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
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
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
  }),
})); 