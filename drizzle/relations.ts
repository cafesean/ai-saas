import { relations } from "drizzle-orm/relations";
import { rules, ruleFlows, conditionGroups, conditions, knowledgeBases, conversations, conversationMessages, decisionTables, decisionTableInputs, decisionTableInputConditions, decisionTableRows, decisionTableOutputs, decisionTableOutputResults, workflows, edges, endpoints, models, inferences, knowledgeBaseDocuments, modelMetrics, nodes, ruleFlowActions, workflowRunHistory } from "./schema";

export const ruleFlowsRelations = relations(ruleFlows, ({one, many}) => ({
	rule: one(rules, {
		fields: [ruleFlows.ruleId],
		references: [rules.id]
	}),
	conditionGroups: many(conditionGroups),
	ruleFlowActions: many(ruleFlowActions),
}));

export const rulesRelations = relations(rules, ({many}) => ({
	ruleFlows: many(ruleFlows),
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

export const knowledgeBasesRelations = relations(knowledgeBases, ({many}) => ({
	conversations: many(conversations),
	knowledgeBaseDocuments: many(knowledgeBaseDocuments),
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

export const decisionTablesRelations = relations(decisionTables, ({many}) => ({
	decisionTableInputs: many(decisionTableInputs),
	decisionTableRows: many(decisionTableRows),
	decisionTableOutputs: many(decisionTableOutputs),
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

export const workflowsRelations = relations(workflows, ({many}) => ({
	edges: many(edges),
	endpoints: many(endpoints),
	nodes: many(nodes),
	workflowRunHistories: many(workflowRunHistory),
}));

export const endpointsRelations = relations(endpoints, ({one}) => ({
	workflow: one(workflows, {
		fields: [endpoints.workflowId],
		references: [workflows.uuid]
	}),
}));

export const inferencesRelations = relations(inferences, ({one}) => ({
	model: one(models, {
		fields: [inferences.modelId],
		references: [models.id]
	}),
}));

export const modelsRelations = relations(models, ({many}) => ({
	inferences: many(inferences),
	modelMetrics: many(modelMetrics),
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

export const workflowRunHistoryRelations = relations(workflowRunHistory, ({one}) => ({
	workflow: one(workflows, {
		fields: [workflowRunHistory.workflowId],
		references: [workflows.uuid]
	}),
}));