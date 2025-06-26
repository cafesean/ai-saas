import { pgTable, index, uniqueIndex, foreignKey, unique, integer, uuid, varchar, text, timestamp, numeric, boolean, serial, jsonb, json, bigint, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const lookupTables = pgTable("lookup_tables", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "lookup_tables_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	uuid: uuid().defaultRandom().notNull(),
	orgId: integer("org_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	status: varchar({ length: 50 }).default('draft').notNull(),
	version: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: integer("created_by").notNull(),
	updatedBy: integer("updated_by").notNull(),
}, (table) => [
	index("lookup_tables_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("lookup_tables_org_name_idx").using("btree", table.orgId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "lookup_tables_org_id_orgs_id_fk"
		}).onDelete("restrict"),
	unique("lookup_tables_uuid_unique").on(table.uuid),
]);

export const lookupTableDimensionBins = pgTable("lookup_table_dimension_bins", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "lookup_table_dimension_bins_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	uuid: uuid().defaultRandom().notNull(),
	orgId: integer("org_id").notNull(),
	lookupTableId: integer("lookup_table_id").notNull(),
	dimension: integer(),
	dimensionOrder: integer("dimension_order").notNull(),
	binIndex: integer("bin_index").notNull(),
	label: varchar({ length: 255 }).notNull(),
	binType: varchar("bin_type", { length: 50 }).notNull(),
	exactValue: text("exact_value"),
	rangeMin: numeric("range_min", { precision: 15, scale:  6 }),
	rangeMax: numeric("range_max", { precision: 15, scale:  6 }),
	isMinInclusive: boolean("is_min_inclusive").default(true),
	isMaxInclusive: boolean("is_max_inclusive").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("dimension_bins_dimension_order_idx").using("btree", table.lookupTableId.asc().nullsLast().op("int4_ops"), table.dimensionOrder.asc().nullsLast().op("int4_ops")),
	index("dimension_bins_lookup_table_idx").using("btree", table.lookupTableId.asc().nullsLast().op("int4_ops")),
	index("dimension_bins_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.lookupTableId],
			foreignColumns: [lookupTables.id],
			name: "lookup_table_dimension_bins_lookup_table_id_lookup_tables_id_fk"
		}).onDelete("cascade"),
	unique("lookup_table_dimension_bins_uuid_unique").on(table.uuid),
]);

export const lookupTableInputs = pgTable("lookup_table_inputs", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "lookup_table_inputs_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	uuid: uuid().defaultRandom().notNull(),
	orgId: integer("org_id").notNull(),
	lookupTableId: integer("lookup_table_id").notNull(),
	variableId: integer("variable_id").notNull(),
	dimensionOrder: integer("dimension_order").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("lookup_inputs_lookup_table_idx").using("btree", table.lookupTableId.asc().nullsLast().op("int4_ops")),
	index("lookup_inputs_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("lookup_inputs_unique_dimension_idx").using("btree", table.lookupTableId.asc().nullsLast().op("int4_ops"), table.dimensionOrder.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.lookupTableId],
			foreignColumns: [lookupTables.id],
			name: "lookup_table_inputs_lookup_table_id_lookup_tables_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.variableId],
			foreignColumns: [variables.id],
			name: "lookup_table_inputs_variable_id_variables_id_fk"
		}).onDelete("restrict"),
	unique("lookup_table_inputs_uuid_unique").on(table.uuid),
]);

export const lookupTableOutputs = pgTable("lookup_table_outputs", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "lookup_table_outputs_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	uuid: uuid().defaultRandom().notNull(),
	orgId: integer("org_id").notNull(),
	lookupTableId: integer("lookup_table_id").notNull(),
	variableId: integer("variable_id").notNull(),
	outputOrder: integer("output_order").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("lookup_outputs_lookup_table_idx").using("btree", table.lookupTableId.asc().nullsLast().op("int4_ops")),
	index("lookup_outputs_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("lookup_outputs_unique_output_idx").using("btree", table.lookupTableId.asc().nullsLast().op("int4_ops"), table.outputOrder.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.lookupTableId],
			foreignColumns: [lookupTables.id],
			name: "lookup_table_outputs_lookup_table_id_lookup_tables_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.variableId],
			foreignColumns: [variables.id],
			name: "lookup_table_outputs_variable_id_variables_id_fk"
		}).onDelete("restrict"),
	unique("lookup_table_outputs_uuid_unique").on(table.uuid),
]);

export const auditLogs = pgTable("audit_logs", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	action: varchar({ length: 100 }).notNull(),
	resource: varchar({ length: 100 }),
	userId: integer("user_id"),
	orgId: integer("org_id"),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	details: jsonb(),
	severity: varchar({ length: 20 }).default('INFO').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("audit_logs_action_idx").using("btree", table.action.asc().nullsLast().op("text_ops")),
	index("audit_logs_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("audit_logs_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("audit_logs_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("audit_logs_severity_idx").using("btree", table.severity.asc().nullsLast().op("text_ops")),
	index("audit_logs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("audit_logs_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "audit_logs_user_id_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "audit_logs_org_id_orgs_id_fk"
		}).onDelete("set null"),
	unique("audit_logs_uuid_unique").on(table.uuid),
]);

export const permissions = pgTable("permissions", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	slug: varchar({ length: 100 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	description: text(),
	category: varchar({ length: 50 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("permissions_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("permissions_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	uniqueIndex("permissions_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	uniqueIndex("permissions_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	unique("permissions_uuid_unique").on(table.uuid),
	unique("permissions_slug_unique").on(table.slug),
]);

export const roles = pgTable("roles", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	isSystemRole: boolean("is_system_role").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("roles_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	uniqueIndex("roles_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("roles_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	unique("roles_uuid_unique").on(table.uuid),
]);

export const testScenarios = pgTable("test_scenarios", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	artifactType: varchar("artifact_type", { length: 50 }).notNull(),
	artifactId: uuid("artifact_id").notNull(),
	inputData: json("input_data").notNull(),
	expectedOutput: json("expected_output"),
	actualOutput: json("actual_output"),
	lastRunAt: timestamp("last_run_at", { withTimezone: true, mode: 'string' }),
	lastRunStatus: varchar("last_run_status", { length: 50 }),
	orgId: integer("org_id").notNull(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("test_scenario_artifact_idx").using("btree", table.artifactType.asc().nullsLast().op("text_ops"), table.artifactId.asc().nullsLast().op("uuid_ops")),
	index("test_scenario_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("int4_ops")),
	index("test_scenario_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("test_scenario_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("test_scenario_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "test_scenarios_org_id_orgs_id_fk"
		}).onDelete("restrict"),
	unique("test_scenarios_uuid_unique").on(table.uuid),
]);

export const userOrgs = pgTable("user_orgs", {
	userId: integer("user_id").notNull(),
	orgId: integer("org_id").notNull(),
	role: varchar({ length: 100 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_orgs_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("user_orgs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("user_orgs_user_org_unique").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.orgId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_orgs_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "user_orgs_org_id_orgs_id_fk"
		}).onDelete("cascade"),
]);

export const ruleSets = pgTable("rule_sets", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	inputSchema: json("input_schema"),
	outputSchema: json("output_schema"),
	version: integer().default(1).notNull(),
	status: varchar({ length: 50 }).default('draft').notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	publishedBy: integer("published_by"),
	orgId: integer("org_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("rule_set_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("rule_set_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("rule_set_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("rule_set_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "rule_sets_org_id_orgs_id_fk"
		}).onDelete("restrict"),
	unique("rule_sets_uuid_unique").on(table.uuid),
	unique("rule_set_org_name_unique").on(table.name, table.orgId),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	username: varchar({ length: 255 }),
	password: text(),
	avatar: text(),
	phone: varchar({ length: 50 }),
	isActive: boolean("is_active").default(true).notNull(),
	orgData: jsonb("org_data").default({"orgs":[],"currentOrgId":null}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	sessionTimeoutPreference: integer("session_timeout_preference").default(1440),
}, (table) => [
	uniqueIndex("users_v2_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_v2_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("users_v2_org_data_gin_idx").using("gin", table.orgData.asc().nullsLast().op("jsonb_ops")),
	uniqueIndex("users_v2_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	unique("users_uuid_unique").on(table.uuid),
	unique("users_email_unique").on(table.email),
]);

export const orgs = pgTable("orgs", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	slug: varchar({ length: 255 }),
	logoUrl: text("logo_url"),
	website: text(),
	businessAddress: text("business_address"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("orgs_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	uniqueIndex("orgs_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	uniqueIndex("orgs_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	unique("orgs_uuid_unique").on(table.uuid),
	unique("orgs_slug_unique").on(table.slug),
]);

export const lookupTableCells = pgTable("lookup_table_cells", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "lookup_table_cells_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	uuid: uuid().defaultRandom().notNull(),
	orgId: integer("org_id").notNull(),
	lookupTableId: integer("lookup_table_id").notNull(),
	row1BinId: integer("row_1_bin_id"),
	row2BinId: integer("row_2_bin_id"),
	outputValue: text("output_value"),
	inputCoordinates: json("input_coordinates"),
	outputValues: json("output_values"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("cells_lookup_table_idx").using("btree", table.lookupTableId.asc().nullsLast().op("int4_ops")),
	index("cells_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.lookupTableId],
			foreignColumns: [lookupTables.id],
			name: "lookup_table_cells_lookup_table_id_lookup_tables_id_fk"
		}).onDelete("cascade"),
	unique("lookup_table_cells_uuid_unique").on(table.uuid),
]);

export const variables = pgTable("variables", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	dataType: varchar("data_type", { length: 50 }).notNull(),
	logicType: varchar("logic_type", { length: 50 }).notNull(),
	formula: text(),
	lookupTableId: uuid("lookup_table_id"),
	defaultValue: text("default_value"),
	version: integer().default(1).notNull(),
	status: varchar({ length: 50 }).default('draft').notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	publishedBy: integer("published_by"),
	orgId: integer("org_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("variable_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("variable_logic_type_idx").using("btree", table.logicType.asc().nullsLast().op("text_ops")),
	index("variable_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("variable_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("variable_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "variables_org_id_orgs_id_fk"
		}).onDelete("restrict"),
	unique("variables_uuid_unique").on(table.uuid),
	unique("variable_org_name_unique").on(table.name, table.orgId),
]);

export const ruleSetSteps = pgTable("rule_set_steps", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	ruleSetId: uuid("rule_set_id").notNull(),
	stepOrder: integer("step_order").notNull(),
	stepName: varchar("step_name", { length: 255 }).notNull(),
	artifactType: varchar("artifact_type", { length: 50 }).notNull(),
	artifactId: uuid("artifact_id").notNull(),
	inputMapping: json("input_mapping"),
	outputMapping: json("output_mapping"),
	executionCondition: text("execution_condition"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("rule_set_step_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("rule_set_step_order_idx").using("btree", table.stepOrder.asc().nullsLast().op("int4_ops")),
	index("rule_set_step_rule_set_id_idx").using("btree", table.ruleSetId.asc().nullsLast().op("uuid_ops")),
	index("rule_set_step_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ruleSetId],
			foreignColumns: [ruleSets.uuid],
			name: "rule_set_steps_rule_set_id_rule_sets_uuid_fk"
		}).onDelete("cascade"),
	unique("rule_set_steps_uuid_unique").on(table.uuid),
	unique("rule_set_step_order_unique").on(table.ruleSetId, table.stepOrder),
]);

export const modelGroups = pgTable("model_groups", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	strategy: varchar({ length: 100 }).default('champion_challenger').notNull(),
	status: varchar({ length: 100 }).default('configuring').notNull(),
	trafficConfig: json("traffic_config"),
	testMetadata: json("test_metadata"),
	promotionRules: json("promotion_rules"),
	orgId: integer("org_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("model_group_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("model_group_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("model_group_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("model_group_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "model_groups_org_id_orgs_id_fk"
		}).onDelete("restrict"),
	unique("model_groups_uuid_unique").on(table.uuid),
]);

export const modelGroupMemberships = pgTable("model_group_memberships", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	modelGroupId: integer("model_group_id").notNull(),
	modelId: integer("model_id").notNull(),
	role: varchar({ length: 50 }).default('challenger').notNull(),
	trafficPercentage: integer("traffic_percentage").default(0),
	assignedAt: timestamp("assigned_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("model_group_membership_group_id_idx").using("btree", table.modelGroupId.asc().nullsLast().op("int4_ops")),
	index("model_group_membership_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("model_group_membership_model_id_idx").using("btree", table.modelId.asc().nullsLast().op("int4_ops")),
	index("model_group_membership_role_idx").using("btree", table.role.asc().nullsLast().op("text_ops")),
	index("model_group_membership_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("unique_active_model_group_membership").using("btree", table.modelGroupId.asc().nullsLast().op("int4_ops"), table.modelId.asc().nullsLast().op("bool_ops"), table.isActive.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.modelGroupId],
			foreignColumns: [modelGroups.id],
			name: "model_group_memberships_model_group_id_model_groups_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [models.id],
			name: "model_group_memberships_model_id_models_id_fk"
		}).onDelete("cascade"),
	unique("model_group_memberships_uuid_unique").on(table.uuid),
]);

export const providers = pgTable("providers", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	providerId: varchar("provider_id", { length: 100 }).notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	type: varchar({ length: 50 }).notNull(),
	enabled: boolean().default(true).notNull(),
	apiKey: varchar("api_key", { length: 500 }).notNull(),
	baseUrl: varchar("base_url", { length: 500 }),
	timeout: integer().default(30000),
	maxRetries: integer("max_retries").default(3),
	config: json(),
	rateLimiting: json("rate_limiting"),
	lastHealthCheck: timestamp("last_health_check", { withTimezone: true, mode: 'string' }),
	healthStatus: varchar("health_status", { length: 50 }).default('unknown'),
	healthError: text("health_error"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("providers_enabled_idx").using("btree", table.enabled.asc().nullsLast().op("bool_ops")),
	index("providers_provider_id_idx").using("btree", table.providerId.asc().nullsLast().op("text_ops")),
	index("providers_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	unique("providers_uuid_unique").on(table.uuid),
	unique("providers_provider_id_unique").on(table.providerId),
]);

export const nodeTypes = pgTable("node_types", {
	id: uuid().defaultRandom().notNull(),
	type: varchar({ length: 256 }).notNull(),
	category: varchar({ length: 256 }).notNull(),
	description: varchar({ length: 1024 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("node_type_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("node_type_id_idx").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("node_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("node_type_uuid_idx").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
]);

export const templates = pgTable("templates", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	flowId: varchar("flow_id", { length: 256 }).notNull(),
	provider: varchar({ length: 256 }),
	versionId: varchar("version_id", { length: 256 }),
	instanceId: varchar("instance_id", { length: 256 }),
	userInputs: json("user_inputs"),
	workflowJson: json("workflow_json"),
	status: varchar({ length: 100 }).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	orgId: integer("org_id").notNull(),
}, (table) => [
	index("template_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("template_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("template_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "templates_org_id_orgs_id_fk"
		}).onDelete("restrict"),
]);

export const widgets = pgTable("widgets", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar().notNull(),
	type: varchar({ length: 100 }).notNull(),
	workflowId: uuid("workflow_id").notNull(),
	status: varchar({ length: 100 }).default('active').notNull(),
	code: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	orgId: integer("org_id").notNull(),
}, (table) => [
	index("widget_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("widget_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("widget_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "widgets_org_id_orgs_id_fk"
		}).onDelete("restrict"),
	unique("widgets_workflow_id_unique").on(table.workflowId),
]);

export const ruleFlows = pgTable("rule_flows", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	ruleId: integer("rule_id").notNull(),
	type: varchar({ length: 200 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("rule_flow_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("rule_flow_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ruleId],
			foreignColumns: [rules.id],
			name: "rule_flows_rule_id_rules_id_fk"
		}).onDelete("cascade"),
]);

export const conditionGroups = pgTable("condition_groups", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	ruleFlowId: integer("rule_flow_id").notNull(),
	parentGroupId: integer("parent_group_id"),
	type: varchar({ length: 200 }),
	logicalOperator: text("logical_operator").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("condition_groups_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("condition_groups_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ruleFlowId],
			foreignColumns: [ruleFlows.id],
			name: "condition_groups_rule_flow_id_rule_flows_id_fk"
		}).onDelete("cascade"),
]);

export const conditions = pgTable("conditions", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	conditionGroupId: integer("condition_group_id").notNull(),
	field: text().notNull(),
	operator: text().notNull(),
	value: text().notNull(),
	type: varchar({ length: 200 }),
	dataType: text("data_type").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("condition_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("condition_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.conditionGroupId],
			foreignColumns: [conditionGroups.id],
			name: "conditions_condition_group_id_condition_groups_id_fk"
		}).onDelete("cascade"),
]);

export const conversations = pgTable("conversations", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	kbId: uuid("kb_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("conversations_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("conversations_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.kbId],
			foreignColumns: [knowledgeBases.uuid],
			name: "conversations_kb_id_knowledge_bases_uuid_fk"
		}).onDelete("cascade"),
]);

export const conversationMessages = pgTable("conversation_messages", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	role: varchar({ length: 20 }).notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.uuid],
			name: "conversation_messages_conversation_id_conversations_uuid_fk"
		}).onDelete("cascade"),
]);

export const decisionTableInputs = pgTable("decision_table_inputs", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	dtId: uuid("dt_id").notNull(),
	name: varchar().notNull(),
	description: text(),
	dataType: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("dt_input_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("dt_input_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.dtId],
			foreignColumns: [decisionTables.uuid],
			name: "decision_table_inputs_dt_id_decision_tables_uuid_fk"
		}).onDelete("cascade"),
]);

export const decisionTableInputConditions = pgTable("decision_table_input_conditions", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	dtRowId: uuid("dt_row_id").notNull(),
	dtInputId: uuid("dt_input_id").notNull(),
	condition: text(),
	value: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("dt_input_condition_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("dt_input_condition_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.dtInputId],
			foreignColumns: [decisionTableInputs.uuid],
			name: "dt_input_condition_dt_input_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.dtRowId],
			foreignColumns: [decisionTableRows.uuid],
			name: "dt_input_condition_dt_row_id_fkey"
		}).onDelete("cascade"),
]);

export const decisionTableRows = pgTable("decision_table_rows", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	dtId: uuid("dt_id").notNull(),
	order: integer().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("dt_row_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("dt_row_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.dtId],
			foreignColumns: [decisionTables.uuid],
			name: "decision_table_rows_dt_id_decision_tables_uuid_fk"
		}).onDelete("cascade"),
]);

export const decisionTableOutputs = pgTable("decision_table_outputs", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	dtId: uuid("dt_id").notNull(),
	name: varchar().notNull(),
	description: text(),
	dataType: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("dt_output_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("dt_output_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.dtId],
			foreignColumns: [decisionTables.uuid],
			name: "decision_table_outputs_dt_id_decision_tables_uuid_fk"
		}).onDelete("cascade"),
]);

export const decisionTableOutputResults = pgTable("decision_table_output_results", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	dtRowId: uuid("dt_row_id").notNull(),
	dtOutputId: uuid("dt_output_id").notNull(),
	result: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("dt_output_result_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("dt_output_result_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.dtOutputId],
			foreignColumns: [decisionTableOutputs.uuid],
			name: "dt_output_result_dt_output_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.dtRowId],
			foreignColumns: [decisionTableRows.uuid],
			name: "dt_output_result_dt_row_id_fkey"
		}).onDelete("cascade"),
]);

export const edges = pgTable("edges", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	source: varchar({ length: 200 }).notNull(),
	target: varchar({ length: 200 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	workflowId: uuid("workflow_id").notNull(),
	animated: boolean().default(false).notNull(),
	sourceHandle: text("source_handle"),
	targetHandle: text("target_handle"),
}, (table) => [
	index("edge_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("edge_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.workflowId],
			foreignColumns: [workflows.uuid],
			name: "edges_workflow_id_workflows_uuid_fk"
		}).onDelete("cascade"),
]);

export const inferences = pgTable("inferences", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	modelId: integer("model_id").notNull(),
	input: json(),
	output: json(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [models.id],
			name: "inferences_model_id_models_id_fk"
		}).onDelete("cascade"),
]);

export const knowledgeBaseDocuments = pgTable("knowledge_base_documents", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	kbId: uuid("kb_id").notNull(),
	name: varchar({ length: 200 }).notNull(),
	status: varchar({ length: 100 }).default('Processing').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	size: bigint({ mode: "number" }).notNull(),
	path: text().notNull(),
	chunkSize: varchar({ length: 100 }).default('1000'),
	chunkOverlap: varchar("chunk_overlap", { length: 100 }).default('200'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("kb_document_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("kb_document_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.kbId],
			foreignColumns: [knowledgeBases.uuid],
			name: "knowledge_base_documents_kb_id_knowledge_bases_uuid_fk"
		}).onDelete("cascade"),
]);

export const modelMetrics = pgTable("model_metrics", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	modelId: integer("model_id").notNull(),
	ks: varchar({ length: 100 }),
	auroc: varchar({ length: 100 }),
	gini: varchar({ length: 100 }),
	accuracy: varchar({ length: 100 }),
	precision: varchar({ length: 100 }),
	recall: varchar({ length: 100 }),
	f1: varchar({ length: 100 }),
	brierScore: varchar("brier_score", { length: 100 }),
	logLoss: varchar("log_loss", { length: 100 }),
	inference: json(),
	ksChart: text("ks_chart"),
	aurocChart: text("auroc_chart"),
	giniChart: text("gini_chart"),
	accuracyChart: text("accuracy_chart"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	version: varchar({ length: 100 }).notNull(),
	features: json(),
	outputs: json(),
	chartsData: json("charts_data"),
	featureAnalysis: json("feature_analysis"),
	modelInfoDetails: json("model_info_details"),
}, (table) => [
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [models.id],
			name: "model_metrics_model_id_models_id_fk"
		}).onDelete("cascade"),
]);

export const nodes = pgTable("nodes", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	type: varchar({ length: 200 }),
	position: json(),
	data: json(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	workflowId: uuid("workflow_id").notNull(),
}, (table) => [
	index("node_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("node_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.workflowId],
			foreignColumns: [workflows.uuid],
			name: "nodes_workflow_id_workflows_uuid_fk"
		}).onDelete("cascade"),
]);

export const ruleFlowActions = pgTable("rule_flow_actions", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	ruleFlowId: integer("rule_flow_id").notNull(),
	type: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("rule_flow_action_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("rule_flow_action_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ruleFlowId],
			foreignColumns: [ruleFlows.id],
			name: "rule_flow_actions_rule_flow_id_rule_flows_id_fk"
		}).onDelete("cascade"),
]);

export const knowledgeBases = pgTable("knowledge_bases", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	vectorDb: varchar("vector_db", { length: 300 }).notNull(),
	embeddingModel: varchar("embedding_model", { length: 300 }).notNull(),
	status: varchar({ length: 100 }).default('Draft').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	orgId: integer("org_id"),
}, (table) => [
	index("knowledge_base_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("knowledge_base_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("knowledge_base_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "knowledge_bases_org_id_orgs_id_fk"
		}).onDelete("restrict"),
]);

export const workflows = pgTable("workflows", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	userInputs: json("user_inputs"),
	workflowJson: json("workflow_json"),
	flowId: varchar("flow_id", { length: 200 }),
	status: varchar({ length: 100 }).default('Draft').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	type: varchar({ length: 100 }),
	orgId: integer("org_id").notNull(),
}, (table) => [
	index("workflow_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("workflow_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("workflow_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "workflows_org_id_orgs_id_fk"
		}).onDelete("restrict"),
]);

export const decisionTables = pgTable("decision_tables", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar().notNull(),
	description: text(),
	status: varchar({ length: 100 }).default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	version: integer().default(1).notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	publishedBy: integer("published_by"),
	orgId: integer("org_id").notNull(),
}, (table) => [
	index("dt_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("dt_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("dt_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("dt_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	index("dt_version_idx").using("btree", table.version.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "decision_tables_org_id_orgs_id_fk"
		}).onDelete("restrict"),
]);

export const endpoints = pgTable("endpoints", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	workflowId: uuid("workflow_id").notNull(),
	uri: text().notNull(),
	method: varchar({ length: 100 }).default('POST').notNull(),
	payload: json(),
	status: varchar({ length: 100 }).default('active').notNull(),
	flowUri: text("flow_uri").notNull(),
	flowMethod: varchar("flow_method", { length: 100 }).default('POST').notNull(),
	clientId: text("client_id").notNull(),
	clientSecret: text("client_secret").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	orgId: integer("org_id").notNull(),
}, (table) => [
	index("endpoint_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("endpoint_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("endpoint_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "endpoints_org_id_orgs_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.workflowId],
			foreignColumns: [workflows.uuid],
			name: "endpoints_workflow_id_workflows_uuid_fk"
		}).onDelete("cascade"),
]);

export const models = pgTable("models", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	fileName: varchar("file_name", { length: 200 }).notNull(),
	fileKey: varchar("file_key", { length: 200 }).notNull(),
	metadataFileName: varchar("metadata_file_name", { length: 200 }),
	metadataFileKey: varchar("metadata_file_key", { length: 200 }),
	defineInputs: json("define_inputs"),
	status: varchar({ length: 100 }).default('inactive').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	type: varchar({ length: 100 }),
	framework: varchar({ length: 100 }),
	orgId: integer("org_id").notNull(),
	provider: varchar({ length: 50 }),
	architecture: varchar({ length: 100 }),
	capabilities: json(),
	modelInfo: json("model_info"),
	trainingInfo: json("training_info"),
	performanceMetrics: json("performance_metrics"),
	providerConfig: json("provider_config"),
	enhancedInputSchema: json("enhanced_input_schema"),
	enhancedOutputSchema: json("enhanced_output_schema"),
}, (table) => [
	index("model_architecture_idx").using("btree", table.architecture.asc().nullsLast().op("text_ops")),
	index("model_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("model_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("model_provider_idx").using("btree", table.provider.asc().nullsLast().op("text_ops")),
	index("model_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "models_org_id_orgs_id_fk"
		}).onDelete("restrict"),
]);

export const workflowRunHistory = pgTable("workflow_run_history", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	workflowId: uuid("workflow_id").notNull(),
	path: varchar({ length: 200 }),
	method: varchar({ length: 100 }),
	payload: json(),
	response: json(),
	status: varchar({ length: 100 }).default('running').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("workflow_run_history_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("workflow_run_history_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.workflowId],
			foreignColumns: [workflows.uuid],
			name: "workflow_run_history_workflow_id_workflows_uuid_fk"
		}).onDelete("cascade"),
]);

export const rules = pgTable("rules", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar().notNull(),
	description: text(),
	status: varchar({ length: 100 }).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	orgId: integer("org_id").notNull(),
}, (table) => [
	index("rule_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("rule_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("rule_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "rules_org_id_orgs_id_fk"
		}).onDelete("restrict"),
]);

export const rolePermissions = pgTable("role_permissions", {
	roleId: integer("role_id").notNull(),
	permissionId: integer("permission_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("role_permissions_permission_id_idx").using("btree", table.permissionId.asc().nullsLast().op("int4_ops")),
	index("role_permissions_role_id_idx").using("btree", table.roleId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "role_permissions_role_id_roles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [permissions.id],
			name: "role_permissions_permission_id_permissions_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.roleId, table.permissionId], name: "role_permissions_role_id_permission_id_pk"}),
]);

export const userRoles = pgTable("user_roles", {
	userId: integer("user_id").notNull(),
	orgId: integer("org_id").notNull(),
	roleId: integer("role_id").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	assignedAt: timestamp("assigned_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	assignedBy: integer("assigned_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_roles_assigned_by_idx").using("btree", table.assignedBy.asc().nullsLast().op("int4_ops")),
	index("user_roles_org_id_idx").using("btree", table.orgId.asc().nullsLast().op("int4_ops")),
	index("user_roles_role_id_idx").using("btree", table.roleId.asc().nullsLast().op("int4_ops")),
	index("user_roles_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_roles_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.orgId],
			foreignColumns: [orgs.id],
			name: "user_roles_org_id_orgs_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "user_roles_role_id_roles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assignedBy],
			foreignColumns: [users.id],
			name: "user_roles_assigned_by_users_id_fk"
		}),
	primaryKey({ columns: [table.userId, table.orgId, table.roleId], name: "user_roles_user_id_org_id_role_id_pk"}),
]);
