"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRolesRelations = exports.rolePermissionsRelations = exports.permissionsRelations = exports.rolesRelations = exports.userRoles = exports.rolePermissions = exports.permissions = exports.roles = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
var tenant_1 = require("./tenant");
var tenant_2 = require("./tenant");
// Roles table - defines system roles
exports.roles = (0, pg_core_1.pgTable)("roles", {
    id: (0, pg_core_1.serial)("id").notNull().primaryKey(),
    uuid: (0, pg_core_1.uuid)("uuid").unique().notNull().defaultRandom(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    isSystemRole: (0, pg_core_1.boolean)("is_system_role").default(false).notNull(), // Built-in roles vs custom roles
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .defaultNow()
        .notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", {
        withTimezone: true,
        mode: "date",
    })
        .defaultNow()
        .notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("roles_id_idx").on(table.id),
    (0, pg_core_1.uniqueIndex)("roles_uuid_idx").on(table.uuid),
    (0, pg_core_1.uniqueIndex)("roles_name_idx").on(table.name),
]; });
// Permissions table - defines all available permissions in the system
exports.permissions = (0, pg_core_1.pgTable)("permissions", {
    id: (0, pg_core_1.serial)("id").notNull().primaryKey(),
    uuid: (0, pg_core_1.uuid)("uuid").unique().notNull().defaultRandom(),
    slug: (0, pg_core_1.varchar)("slug", { length: 100 }).notNull().unique(), // e.g., "decision_table:create", "workflow:publish"
    name: (0, pg_core_1.varchar)("name", { length: 150 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category", { length: 50 }), // e.g., "workflow", "decision_table", "model"
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .defaultNow()
        .notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", {
        withTimezone: true,
        mode: "date",
    })
        .defaultNow()
        .notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("permissions_id_idx").on(table.id),
    (0, pg_core_1.uniqueIndex)("permissions_uuid_idx").on(table.uuid),
    (0, pg_core_1.uniqueIndex)("permissions_slug_idx").on(table.slug),
    (0, pg_core_1.index)("permissions_category_idx").on(table.category),
]; });
// Role-Permission mapping table - defines which permissions each role has
exports.rolePermissions = (0, pg_core_1.pgTable)("role_permissions", {
    roleId: (0, pg_core_1.integer)("role_id")
        .notNull()
        .references(function () { return exports.roles.id; }, { onDelete: "cascade" }),
    permissionId: (0, pg_core_1.integer)("permission_id")
        .notNull()
        .references(function () { return exports.permissions.id; }, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .defaultNow()
        .notNull(),
}, function (table) { return [
    (0, pg_core_1.primaryKey)({ columns: [table.roleId, table.permissionId] }),
    (0, pg_core_1.index)("role_permissions_role_id_idx").on(table.roleId),
    (0, pg_core_1.index)("role_permissions_permission_id_idx").on(table.permissionId),
]; });
// User-Role assignments table - defines which roles users have within specific tenants
exports.userRoles = (0, pg_core_1.pgTable)("user_roles", {
    userId: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(function () { return tenant_1.users.id; }, { onDelete: "cascade" }),
    tenantId: (0, pg_core_1.integer)("tenant_id")
        .notNull()
        .references(function () { return tenant_2.tenants.id; }, { onDelete: "cascade" }),
    roleId: (0, pg_core_1.integer)("role_id")
        .notNull()
        .references(function () { return exports.roles.id; }, { onDelete: "cascade" }),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    assignedAt: (0, pg_core_1.timestamp)("assigned_at", {
        withTimezone: true,
        mode: "date",
    })
        .defaultNow()
        .notNull(),
    assignedBy: (0, pg_core_1.integer)("assigned_by").references(function () { return tenant_1.users.id; }), // User who assigned the role
    createdAt: (0, pg_core_1.timestamp)("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .defaultNow()
        .notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", {
        withTimezone: true,
        mode: "date",
    })
        .defaultNow()
        .notNull(),
}, function (table) { return [
    // Composite unique constraint to prevent duplicate role assignments
    (0, pg_core_1.primaryKey)({ columns: [table.userId, table.tenantId, table.roleId] }),
    (0, pg_core_1.index)("user_roles_user_id_idx").on(table.userId),
    (0, pg_core_1.index)("user_roles_tenant_id_idx").on(table.tenantId),
    (0, pg_core_1.index)("user_roles_role_id_idx").on(table.roleId),
    (0, pg_core_1.index)("user_roles_assigned_by_idx").on(table.assignedBy),
]; });
// Relations
exports.rolesRelations = (0, drizzle_orm_1.relations)(exports.roles, function (_a) {
    var many = _a.many;
    return ({
        rolePermissions: many(exports.rolePermissions),
        userRoles: many(exports.userRoles),
    });
});
exports.permissionsRelations = (0, drizzle_orm_1.relations)(exports.permissions, function (_a) {
    var many = _a.many;
    return ({
        rolePermissions: many(exports.rolePermissions),
    });
});
exports.rolePermissionsRelations = (0, drizzle_orm_1.relations)(exports.rolePermissions, function (_a) {
    var one = _a.one;
    return ({
        role: one(exports.roles, {
            fields: [exports.rolePermissions.roleId],
            references: [exports.roles.id],
        }),
        permission: one(exports.permissions, {
            fields: [exports.rolePermissions.permissionId],
            references: [exports.permissions.id],
        }),
    });
});
exports.userRolesRelations = (0, drizzle_orm_1.relations)(exports.userRoles, function (_a) {
    var one = _a.one;
    return ({
        user: one(tenant_1.users, {
            fields: [exports.userRoles.userId],
            references: [tenant_1.users.id],
        }),
        tenant: one(tenant_2.tenants, {
            fields: [exports.userRoles.tenantId],
            references: [tenant_2.tenants.id],
        }),
        role: one(exports.roles, {
            fields: [exports.userRoles.roleId],
            references: [exports.roles.id],
        }),
        assignedByUser: one(tenant_1.users, {
            fields: [exports.userRoles.assignedBy],
            references: [tenant_1.users.id],
        }),
    });
});
