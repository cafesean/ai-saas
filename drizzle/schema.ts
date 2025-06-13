import { pgTable, varchar, timestamp, text, integer, index, uniqueIndex, uuid, serial, json, foreignKey, boolean, bigint } from "drizzle-orm/pg-core"
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

export const nodeTypes = pgTable("node_types", {
	id: uuid().defaultRandom().notNull(),
	type: varchar({ length: 256 }).notNull(),
	category: varchar({ length: 256 }).notNull(),
	description: varchar({ length: 1024 }),
	createdAt: timestamp("created_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
	createdAt: timestamp("created_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("template_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("template_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
]);

export const widgets = pgTable("widgets", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar().notNull(),
	type: varchar({ length: 100 }).notNull(),
	workflowId: uuid("workflow_id").notNull(),
	status: varchar({ length: 100 }).default('active').notNull(),
	code: text().notNull(),
	createdAt: timestamp("created_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("widget_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("widget_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("widgets_workflow_id_unique").using("btree", table.workflowId.asc().nullsLast().op("uuid_ops")),
]);

export const ruleFlows = pgTable("rule_flows", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	ruleId: integer("rule_id").notNull(),
	type: varchar({ length: 200 }),
	createdAt: timestamp("created_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
	createdAt: timestamp("created_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
	createdAt: timestamp("created_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("conversation_messages_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.uuid],
			name: "conversation_messages_conversation_id_conversations_uuid_fk"
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("knowledge_base_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("knowledge_base_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
]);

export const decisionTableInputs = pgTable("decision_table_inputs", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	dtId: uuid("dt_id").notNull(),
	name: varchar().notNull(),
	description: text(),
	dataType: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("decision_table_input_conditions_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("dt_row_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("dt_row_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.dtId],
			foreignColumns: [decisionTables.uuid],
			name: "decision_table_rows_dt_id_decision_tables_uuid_fk"
		}).onDelete("cascade"),
]);

export const decisionTables = pgTable("decision_tables", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar().notNull(),
	description: text(),
	status: varchar({ length: 100 }).default('active').notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("dt_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("dt_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
]);

export const decisionTableOutputs = pgTable("decision_table_outputs", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	dtId: uuid("dt_id").notNull(),
	name: varchar().notNull(),
	description: text(),
	dataType: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("decision_table_output_results_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
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

export const workflows = pgTable("workflows", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	userInputs: json("user_inputs"),
	workflowJson: json("workflow_json"),
	flowId: varchar("flow_id", { length: 200 }),
	status: varchar({ length: 100 }).default('Draft').notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	type: varchar({ length: 100 }),
}, (table) => [
	index("workflow_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("workflow_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
]);

export const edges = pgTable("edges", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	source: varchar({ length: 200 }).notNull(),
	target: varchar({ length: 200 }).notNull(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	workflowId: uuid("workflow_id").notNull(),
	animated: boolean().default(false).notNull(),
	sourceHandle: text("source_handle"),
	targetHandle: text("target_handle"),
}, (table) => [
	index("edge_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("edge_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("edges_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.workflowId],
			foreignColumns: [workflows.uuid],
			name: "edges_workflow_id_workflows_uuid_fk"
		}).onDelete("cascade"),
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
	createdAt: timestamp("created_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("endpoint_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("endpoint_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("endpoints_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	type: varchar({ length: 100 }),
	framework: varchar({ length: 100 }),
}, (table) => [
	index("model_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("model_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("models_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
]);

export const inferences = pgTable("inferences", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	modelId: integer("model_id").notNull(),
	input: json(),
	output: json(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("inferences_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("kb_document_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("kb_document_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("knowledge_base_documents_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	version: varchar({ length: 100 }).notNull(),
	features: json(),
	outputs: json(),
	chartsData: json("charts_data"),
	featureAnalysis: json("feature_analysis"),
	modelInfoDetails: json("model_info_details"),
}, (table) => [
	uniqueIndex("model_metrics_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	workflowId: uuid("workflow_id").notNull(),
}, (table) => [
	index("node_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("node_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("nodes_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
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
	createdAt: timestamp("created_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("rule_flow_action_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("rule_flow_action_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ruleFlowId],
			foreignColumns: [ruleFlows.id],
			name: "rule_flow_actions_rule_flow_id_rule_flows_id_fk"
		}).onDelete("cascade"),
]);

export const rules = pgTable("rules", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar().notNull(),
	description: text(),
	status: varchar({ length: 100 }).default('active').notNull(),
	createdAt: timestamp("created_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("rule_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("rule_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
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
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("workflow_run_history_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("workflow_run_history_uuid_idx").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("workflow_run_history_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.workflowId],
			foreignColumns: [workflows.uuid],
			name: "workflow_run_history_workflow_id_workflows_uuid_fk"
		}).onDelete("cascade"),
]);
