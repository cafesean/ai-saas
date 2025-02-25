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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	name: text(),
	countryId: integer("country_id"),
	type: smallint(),
	logoUrl: text("logo_url"),
	slug: text(),
	uuid: uuid().default(sql`uuid_generate_v4()`),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
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
	monthlyRate: numeric("monthly_rate", { precision: 10, scale:  2 }).notNull(),
	levelId: integer("level_id").notNull(),
	ratecardId: integer("ratecard_id").notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("level_rates_uuid_key").using("btree", table.uuid.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.levelId],
			foreignColumns: [levels.id],
			name: "level_rates_level_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.ratecardId],
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("levels_uuid_key").using("btree", table.uuid.asc().nullsLast().op("text_ops")),
]);

export const ratecards = pgTable("ratecards", {
	id: serial().primaryKey().notNull(),
	uuid: text().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	effectiveDate: timestamp("effective_date", { precision: 3, mode: 'string' }).notNull(),
	expireDate: timestamp("expire_date", { precision: 3, mode: 'string' }),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("ratecards_uuid_key").using("btree", table.uuid.asc().nullsLast().op("text_ops")),
]);

export const roles = pgTable("roles", {
	id: serial().primaryKey().notNull(),
	uuid: text().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	roleCode: text("role_code").notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("roles_uuid_key").using("btree", table.uuid.asc().nullsLast().op("text_ops")),
]);

export const user = pgTable("user", {
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	status: smallint(),
	wallets: text().array(),
	walletType: integer("wallet_type"),
	attributes: jsonb(),
	tokens: jsonb(),
	xp: jsonb(),
	profile: jsonb(),
	roleId: integer("role_id").array(),
	orgId: integer("org_id").array(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
	referredBy: text("referred_by"),
	isRegistered: boolean("is_registered"),
	name: text(),
	email: json(),
	password: text(),
	phone: json(),
	avatar: text(),
	username: text(),
	uuid: uuid().default(sql`uuid_generate_v4()`).notNull(),
	id: serial().primaryKey().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
});

export const rolePolicy = pgTable("role_policy", {
	id: serial().primaryKey().notNull(),
	roleId: integer("role_id").notNull(),
	name: text().notNull(),
	canCreate: boolean("can_create").default(false).notNull(),
	canRead: boolean("can_read").default(false).notNull(),
	canUpdate: boolean("can_update").default(false).notNull(),
	canDelete: boolean("can_delete").default(false).notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }),
	metadata: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "role_policy_role_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const levelRoles = pgTable("level_roles", {
	levelId: integer("level_id").notNull(),
	roleId: integer("role_id").notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.levelId],
			foreignColumns: [levels.id],
			name: "level_roles_level_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "level_roles_role_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	primaryKey({ columns: [table.levelId, table.roleId], name: "level_roles_pkey"}),
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
