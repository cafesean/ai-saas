"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTenantsRelations = exports.tenantsRelations = exports.usersRelations = exports.userTenants = exports.tenants = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
// New clean users table (SAAS-31)
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").notNull().primaryKey(),
    uuid: (0, pg_core_1.uuid)("uuid").unique().notNull().defaultRandom(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 255 }),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 255 }),
    username: (0, pg_core_1.varchar)("username", { length: 255 }),
    password: (0, pg_core_1.text)("password"),
    avatar: (0, pg_core_1.text)("avatar"),
    phone: (0, pg_core_1.varchar)("phone", { length: 50 }),
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
    (0, pg_core_1.index)("users_id_idx").on(table.id),
    (0, pg_core_1.uniqueIndex)("users_uuid_idx").on(table.uuid),
    (0, pg_core_1.uniqueIndex)("users_email_idx").on(table.email),
]; });
// New tenants table (SAAS-31)
exports.tenants = (0, pg_core_1.pgTable)("tenants", {
    id: (0, pg_core_1.serial)("id").notNull().primaryKey(),
    uuid: (0, pg_core_1.uuid)("uuid").unique().notNull().defaultRandom(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    slug: (0, pg_core_1.varchar)("slug", { length: 255 }).unique(),
    logoUrl: (0, pg_core_1.text)("logo_url"),
    website: (0, pg_core_1.text)("website"),
    businessAddress: (0, pg_core_1.text)("business_address"),
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
    (0, pg_core_1.index)("tenants_id_idx").on(table.id),
    (0, pg_core_1.uniqueIndex)("tenants_uuid_idx").on(table.uuid),
    (0, pg_core_1.uniqueIndex)("tenants_slug_idx").on(table.slug),
]; });
// User-tenant relationship table (SAAS-31)
exports.userTenants = (0, pg_core_1.pgTable)("user_tenants", {
    userId: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(function () { return exports.users.id; }, { onDelete: "cascade" }),
    tenantId: (0, pg_core_1.integer)("tenant_id")
        .notNull()
        .references(function () { return exports.tenants.id; }, { onDelete: "cascade" }),
    role: (0, pg_core_1.varchar)("role", { length: 100 }).notNull(), // Temporary field for initial mapping
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
    (0, pg_core_1.primaryKey)({ columns: [table.userId, table.tenantId] }),
    (0, pg_core_1.index)("user_tenants_user_id_idx").on(table.userId),
    (0, pg_core_1.index)("user_tenants_tenant_id_idx").on(table.tenantId),
]; });
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, function (_a) {
    var many = _a.many;
    return ({
        userTenants: many(exports.userTenants),
    });
});
exports.tenantsRelations = (0, drizzle_orm_1.relations)(exports.tenants, function (_a) {
    var many = _a.many;
    return ({
        userTenants: many(exports.userTenants),
    });
});
exports.userTenantsRelations = (0, drizzle_orm_1.relations)(exports.userTenants, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.users, {
            fields: [exports.userTenants.userId],
            references: [exports.users.id],
        }),
        tenant: one(exports.tenants, {
            fields: [exports.userTenants.tenantId],
            references: [exports.tenants.id],
        }),
    });
});
