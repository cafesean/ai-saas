import { pgTable, varchar, timestamp, text, integer, serial, smallint, uuid, json, foreignKey, boolean, jsonb, uniqueIndex, numeric, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const prismaMigrations = pgTable("_prisma_migrations", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: timestamp("finished_at", { withTimezone: true, mode: 'string' }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text(),
	rolledBackAt: timestamp("rolled_back_at", { withTimezone: true, mode: 'string' }),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const org = pgTable("org", {
	id: serial().primaryKey().notNull(),
	created_at: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	name: text(),
	countryId: integer("country_id"),
	type: smallint(),
	logoUrl: text("logo_url"),
	slug: text(),
	uuid: uuid().default(sql`uuid_generate_v4()`),
	updated_at: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
	status: smallint(),
	tierId: integer("tier_id").default(1).notNull(),
	categoryId: integer("category_id"),
	planId: integer("plan_id"),
	verifiedAt: timestamp("verified_at", { precision: 3, mode: 'string' }),
	businessAddress: text("business_address"),
	businessLicenses: text("business_licenses").array(),
	linkedinUrl: text("linkedin_url"),
	website: text(),
});

export const group = pgTable("group", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	created_at: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
	policyOps: json("policy_ops"),
	policyOrg: json("policy_org"),
});

export const groupPolicy = pgTable("group_policy", {
	id: serial().primaryKey().notNull(),
	groupId: integer("group_id").notNull(),
	name: text().notNull(),
	canCreate: boolean("can_create").default(false).notNull(),
	canRead: boolean("can_read").default(false).notNull(),
	canUpdate: boolean("can_update").default(false).notNull(),
	canDelete: boolean("can_delete").default(false).notNull(),
	created_at: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
	metadata: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [group.id],
			name: "group_policy_group_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const levelRates = pgTable("level_rates", {
	id: serial().primaryKey().notNull(),
	uuid: text().notNull(),
	monthly_rate: numeric("monthly_rate", { precision: 10, scale:  2 }).notNull(),
	level_id: integer("level_id").notNull(),
	ratecard_id: integer("ratecard_id").notNull(),
	created_at: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updated_at: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("level_rates_uuid_key").using("btree", table.uuid.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.level_id],
			foreignColumns: [levels.id],
			name: "level_rates_level_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.ratecard_id],
			foreignColumns: [ratecards.id],
			name: "level_rates_ratecard_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const levels = pgTable("levels", {
	id: serial().primaryKey().notNull(),
	uuid: text().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	code: text().notNull(),
	created_at: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updated_at: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("levels_uuid_key").using("btree", table.uuid.asc().nullsLast().op("text_ops")),
]);

export const ratecards = pgTable("ratecards", {
	id: serial().primaryKey().notNull(),
	uuid: text().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	effective_date: timestamp("effective_date", { precision: 3, mode: 'string' }).notNull(),
	expire_date: timestamp("expire_date", { precision: 3, mode: 'string' }),
	created_at: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updated_at: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("ratecards_uuid_key").using("btree", table.uuid.asc().nullsLast().op("text_ops")),
]);

export const roles = pgTable("roles", {
	id: serial().primaryKey().notNull(),
	uuid: text().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	role_code: text("role_code").notNull(),
	created_at: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updated_at: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("roles_uuid_key").using("btree", table.uuid.asc().nullsLast().op("text_ops")),
]);

export const user = pgTable("user", {
	created_at: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	status: smallint(),
	attributes: jsonb(),
	profile: jsonb(),
	role_id: integer("role_id").array(),
	org_id: integer("org_id").array(),
	updated_at: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
	referred_by: text("referred_by"),
	is_registered: boolean("is_registered"),
	name: text(),
	email: json(),
	password: text(),
	phone: json(),
	avatar: text(),
	username: text(),
	uuid: uuid().default(sql`uuid_generate_v4()`).notNull(),
	id: serial().primaryKey().notNull(),
	first_name: text("first_name"),
	last_name: text("last_name"),
});

export const rolePolicy = pgTable("role_policy", {
	id: serial().primaryKey().notNull(),
	role_id: integer("role_id").notNull(),
	name: text().notNull(),
	canCreate: boolean("can_create").default(false).notNull(),
	canRead: boolean("can_read").default(false).notNull(),
	canUpdate: boolean("can_update").default(false).notNull(),
	canDelete: boolean("can_delete").default(false).notNull(),
	created_at: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
	metadata: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.role_id],
			foreignColumns: [roles.id],
			name: "role_policy_role_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const levelRoles = pgTable("level_roles", {
	level_id: integer("level_id").notNull(),
	role_id: integer("role_id").notNull(),
	created_at: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.level_id],
			foreignColumns: [levels.id],
			name: "level_roles_level_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.role_id],
			foreignColumns: [roles.id],
			name: "level_roles_role_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	primaryKey({ columns: [table.level_id, table.role_id], name: "level_roles_pkey"}),
]);

export const orgUser = pgTable("org_user", {
	orgId: integer("org_id").notNull(),
	userUuid: uuid("user_uuid"),
	role: text().notNull(),
	userId: integer("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [org.id],
			name: "org_user_org_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "org_user_user_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	primaryKey({ columns: [table.orgId, table.userId], name: "org_user_pkey"}),
]);
