import { relations } from "drizzle-orm/relations";
import { orgs, lookupTables, lookupTableDimensionBins, lookupTableInputs, variables, lookupTableOutputs, users, auditLogs, testScenarios, userOrgs, ruleSets, lookupTableCells, ruleSetSteps, modelGroups, modelGroupMemberships, models, templates, widgets, rules, ruleFlows, conditionGroups, conditions, knowledgeBases, conversations, conversationMessages, decisionTables, decisionTableInputs, decisionTableInputConditions, decisionTableRows, decisionTableOutputs, decisionTableOutputResults, workflows, edges, inferences, knowledgeBaseDocuments, modelMetrics, nodes, ruleFlowActions, endpoints, workflowRunHistory, roles, rolePermissions, permissions, userRoles } from "./schema";

export const lookupTablesRelations = relations(lookupTables, ({one, many}) => ({
	org: one(orgs, {
		fields: [lookupTables.orgId],
		references: [orgs.id]
	}),
	lookupTableDimensionBins: many(lookupTableDimensionBins),
	lookupTableInputs: many(lookupTableInputs),
	lookupTableOutputs: many(lookupTableOutputs),
	lookupTableCells: many(lookupTableCells),
}));

export const orgsRelations = relations(orgs, ({many}) => ({
	lookupTables: many(lookupTables),
	auditLogs: many(auditLogs),
	testScenarios: many(testScenarios),
	userOrgs: many(userOrgs),
	ruleSets: many(ruleSets),
	variables: many(variables),
	modelGroups: many(modelGroups),
	templates: many(templates),
	widgets: many(widgets),
	knowledgeBases: many(knowledgeBases),
	workflows: many(workflows),
	decisionTables: many(decisionTables),
	endpoints: many(endpoints),
	models: many(models),
	rules: many(rules),
	userRoles: many(userRoles),
}));

export const lookupTableDimensionBinsRelations = relations(lookupTableDimensionBins, ({one}) => ({
	lookupTable: one(lookupTables, {
		fields: [lookupTableDimensionBins.lookupTableId],
		references: [lookupTables.id]
	}),
}));

export const lookupTableInputsRelations = relations(lookupTableInputs, ({one}) => ({
	lookupTable: one(lookupTables, {
		fields: [lookupTableInputs.lookupTableId],
		references: [lookupTables.id]
	}),
	variable: one(variables, {
		fields: [lookupTableInputs.variableId],
		references: [variables.id]
	}),
}));

export const variablesRelations = relations(variables, ({one, many}) => ({
	lookupTableInputs: many(lookupTableInputs),
	lookupTableOutputs: many(lookupTableOutputs),
	org: one(orgs, {
		fields: [variables.orgId],
		references: [orgs.id]
	}),
}));

export const lookupTableOutputsRelations = relations(lookupTableOutputs, ({one}) => ({
	lookupTable: one(lookupTables, {
		fields: [lookupTableOutputs.lookupTableId],
		references: [lookupTables.id]
	}),
	variable: one(variables, {
		fields: [lookupTableOutputs.variableId],
		references: [variables.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
	org: one(orgs, {
		fields: [auditLogs.orgId],
		references: [orgs.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	auditLogs: many(auditLogs),
	userOrgs: many(userOrgs),
	userRoles_userId: many(userRoles, {
		relationName: "userRoles_userId_users_id"
	}),
	userRoles_assignedBy: many(userRoles, {
		relationName: "userRoles_assignedBy_users_id"
	}),
}));

export const testScenariosRelations = relations(testScenarios, ({one}) => ({
	org: one(orgs, {
		fields: [testScenarios.orgId],
		references: [orgs.id]
	}),
}));

export const userOrgsRelations = relations(userOrgs, ({one}) => ({
	user: one(users, {
		fields: [userOrgs.userId],
		references: [users.id]
	}),
	org: one(orgs, {
		fields: [userOrgs.orgId],
		references: [orgs.id]
	}),
}));

export const ruleSetsRelations = relations(ruleSets, ({one, many}) => ({
	org: one(orgs, {
		fields: [ruleSets.orgId],
		references: [orgs.id]
	}),
	ruleSetSteps: many(ruleSetSteps),
}));

export const lookupTableCellsRelations = relations(lookupTableCells, ({one}) => ({
	lookupTable: one(lookupTables, {
		fields: [lookupTableCells.lookupTableId],
		references: [lookupTables.id]
	}),
}));

export const ruleSetStepsRelations = relations(ruleSetSteps, ({one}) => ({
	ruleSet: one(ruleSets, {
		fields: [ruleSetSteps.ruleSetId],
		references: [ruleSets.uuid]
	}),
}));

export const modelGroupsRelations = relations(modelGroups, ({one, many}) => ({
	org: one(orgs, {
		fields: [modelGroups.orgId],
		references: [orgs.id]
	}),
	modelGroupMemberships: many(modelGroupMemberships),
}));

export const modelGroupMembershipsRelations = relations(modelGroupMemberships, ({one}) => ({
	modelGroup: one(modelGroups, {
		fields: [modelGroupMemberships.modelGroupId],
		references: [modelGroups.id]
	}),
	model: one(models, {
		fields: [modelGroupMemberships.modelId],
		references: [models.id]
	}),
}));

export const modelsRelations = relations(models, ({one, many}) => ({
	modelGroupMemberships: many(modelGroupMemberships),
	inferences: many(inferences),
	modelMetrics: many(modelMetrics),
	org: one(orgs, {
		fields: [models.orgId],
		references: [orgs.id]
	}),
}));

export const templatesRelations = relations(templates, ({one}) => ({
	org: one(orgs, {
		fields: [templates.orgId],
		references: [orgs.id]
	}),
}));

export const widgetsRelations = relations(widgets, ({one}) => ({
	org: one(orgs, {
		fields: [widgets.orgId],
		references: [orgs.id]
	}),
}));

export const ruleFlowsRelations = relations(ruleFlows, ({one, many}) => ({
	rule: one(rules, {
		fields: [ruleFlows.ruleId],
		references: [rules.id]
	}),
	conditionGroups: many(conditionGroups),
	ruleFlowActions: many(ruleFlowActions),
}));

export const rulesRelations = relations(rules, ({one, many}) => ({
	ruleFlows: many(ruleFlows),
	org: one(orgs, {
		fields: [rules.orgId],
		references: [orgs.id]
	}),
}));

export const conditionGroupsRelations = relations(conditionGroups, ({one, many}) => ({
	ruleFlow: one(ruleFlows, {
		fields: [conditionGroups.ruleFlowId],
		references: [ruleFlows.id]
	}),
	conditions: many(conditions),
}));

export const conditionsRelations = relations(conditions, ({one}) => ({
	conditionGroup: one(conditionGroups, {
		fields: [conditions.conditionGroupId],
		references: [conditionGroups.id]
	}),
}));

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	knowledgeBase: one(knowledgeBases, {
		fields: [conversations.kbId],
		references: [knowledgeBases.uuid]
	}),
	conversationMessages: many(conversationMessages),
}));

export const knowledgeBasesRelations = relations(knowledgeBases, ({one, many}) => ({
	conversations: many(conversations),
	knowledgeBaseDocuments: many(knowledgeBaseDocuments),
	org: one(orgs, {
		fields: [knowledgeBases.orgId],
		references: [orgs.id]
	}),
}));

export const conversationMessagesRelations = relations(conversationMessages, ({one}) => ({
	conversation: one(conversations, {
		fields: [conversationMessages.conversationId],
		references: [conversations.uuid]
	}),
}));

export const decisionTableInputsRelations = relations(decisionTableInputs, ({one, many}) => ({
	decisionTable: one(decisionTables, {
		fields: [decisionTableInputs.dtId],
		references: [decisionTables.uuid]
	}),
	decisionTableInputConditions: many(decisionTableInputConditions),
}));

export const decisionTablesRelations = relations(decisionTables, ({one, many}) => ({
	decisionTableInputs: many(decisionTableInputs),
	decisionTableRows: many(decisionTableRows),
	decisionTableOutputs: many(decisionTableOutputs),
	org: one(orgs, {
		fields: [decisionTables.orgId],
		references: [orgs.id]
	}),
}));

export const decisionTableInputConditionsRelations = relations(decisionTableInputConditions, ({one}) => ({
	decisionTableInput: one(decisionTableInputs, {
		fields: [decisionTableInputConditions.dtInputId],
		references: [decisionTableInputs.uuid]
	}),
	decisionTableRow: one(decisionTableRows, {
		fields: [decisionTableInputConditions.dtRowId],
		references: [decisionTableRows.uuid]
	}),
}));

export const decisionTableRowsRelations = relations(decisionTableRows, ({one, many}) => ({
	decisionTableInputConditions: many(decisionTableInputConditions),
	decisionTable: one(decisionTables, {
		fields: [decisionTableRows.dtId],
		references: [decisionTables.uuid]
	}),
	decisionTableOutputResults: many(decisionTableOutputResults),
}));

export const decisionTableOutputsRelations = relations(decisionTableOutputs, ({one, many}) => ({
	decisionTable: one(decisionTables, {
		fields: [decisionTableOutputs.dtId],
		references: [decisionTables.uuid]
	}),
	decisionTableOutputResults: many(decisionTableOutputResults),
}));

export const decisionTableOutputResultsRelations = relations(decisionTableOutputResults, ({one}) => ({
	decisionTableOutput: one(decisionTableOutputs, {
		fields: [decisionTableOutputResults.dtOutputId],
		references: [decisionTableOutputs.uuid]
	}),
	decisionTableRow: one(decisionTableRows, {
		fields: [decisionTableOutputResults.dtRowId],
		references: [decisionTableRows.uuid]
	}),
}));

export const edgesRelations = relations(edges, ({one}) => ({
	workflow: one(workflows, {
		fields: [edges.workflowId],
		references: [workflows.uuid]
	}),
}));

export const workflowsRelations = relations(workflows, ({one, many}) => ({
	edges: many(edges),
	nodes: many(nodes),
	org: one(orgs, {
		fields: [workflows.orgId],
		references: [orgs.id]
	}),
	endpoints: many(endpoints),
	workflowRunHistories: many(workflowRunHistory),
}));

export const inferencesRelations = relations(inferences, ({one}) => ({
	model: one(models, {
		fields: [inferences.modelId],
		references: [models.id]
	}),
}));

export const knowledgeBaseDocumentsRelations = relations(knowledgeBaseDocuments, ({one}) => ({
	knowledgeBase: one(knowledgeBases, {
		fields: [knowledgeBaseDocuments.kbId],
		references: [knowledgeBases.uuid]
	}),
}));

export const modelMetricsRelations = relations(modelMetrics, ({one}) => ({
	model: one(models, {
		fields: [modelMetrics.modelId],
		references: [models.id]
	}),
}));

export const nodesRelations = relations(nodes, ({one}) => ({
	workflow: one(workflows, {
		fields: [nodes.workflowId],
		references: [workflows.uuid]
	}),
}));

export const ruleFlowActionsRelations = relations(ruleFlowActions, ({one}) => ({
	ruleFlow: one(ruleFlows, {
		fields: [ruleFlowActions.ruleFlowId],
		references: [ruleFlows.id]
	}),
}));

export const endpointsRelations = relations(endpoints, ({one}) => ({
	org: one(orgs, {
		fields: [endpoints.orgId],
		references: [orgs.id]
	}),
	workflow: one(workflows, {
		fields: [endpoints.workflowId],
		references: [workflows.uuid]
	}),
}));

export const workflowRunHistoryRelations = relations(workflowRunHistory, ({one}) => ({
	workflow: one(workflows, {
		fields: [workflowRunHistory.workflowId],
		references: [workflows.uuid]
	}),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	rolePermissions: many(rolePermissions),
	userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	rolePermissions: many(rolePermissions),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	user_userId: one(users, {
		fields: [userRoles.userId],
		references: [users.id],
		relationName: "userRoles_userId_users_id"
	}),
	org: one(orgs, {
		fields: [userRoles.orgId],
		references: [orgs.id]
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	}),
	user_assignedBy: one(users, {
		fields: [userRoles.assignedBy],
		references: [users.id],
		relationName: "userRoles_assignedBy_users_id"
	}),
}));