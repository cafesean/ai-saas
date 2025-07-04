import { templates, templatesRelations } from "./n8n";
import {
  models,
  model_metrics,
  inferences,
  modelGroups,
  modelGroupMemberships,
  modelsRelations,
  model_metricsRelations,
  inferencesRelations,
  modelGroupsRelations,
  modelGroupMembershipsRelations,
} from "./model";
import {
  workflows,
  nodes,
  edges,
  workflowRunHistory,
  workflowsRelations,
  nodesRelations,
  edgesRelations,
} from "./workflow";
import { endpoints, endpointsRelations } from "./endpoint";
import { widgets, widgetsRelations } from "./widget";
import {
  rules,
  rule_flows,
  condition_groups,
  conditions,
  rule_flow_actions,
  rulesRelations,
  ruleFlowsRelations,
  conditionGroupsRelations,
  conditionsRelations,
  ruleFlowActionsRelations,
} from "./rule";
import {
  decision_tables,
  decision_table_rows,
  decision_table_inputs,
  decision_table_outputs,
  decision_table_input_conditions,
  decision_table_output_results,
  decisionTablesRelations,
  decisionTableRowsRelations,
  decisionTableInputsRelations,
  decisionTableOutputsRelations,
  decisionTableInputConditionsRelations,
  decisionTableOutputResultsRelations,
} from "./decision_table";
import {
  knowledge_bases,
  knowledge_base_documents,
  knowledge_base_chunks,
  conversations,
  conversation_messages,
  knowledgeBaseRelations,
  knowledgeBaseDocumentRelations,
  knowledgeBaseChunkRelations,
  knowledgeBaseConversationRelations,
  conversationRelations,
  conversationMessageRelations,
} from "./knowledge_base";
import {
  users,
  orgs,
  userOrgs,
  usersRelations,
  orgsRelations,
  userOrgsRelations,
} from "./org";
import {
  roles,
  permissions,
  rolePermissions,
  userRoles,
  rolesRelations,
  permissionsRelations,
  rolePermissionsRelations,
  userRolesRelations,
} from "./rbac";
import {
  auditLogs,
  auditLogsRelations,
} from "./audit";
import {
  variables,
  variablesRelations,
} from "./variable";
import {
  lookup_tables,
  lookup_table_inputs,
  lookup_table_outputs,
  lookup_table_dimension_bins,
  lookup_table_cells,
  lookupTablesRelations,
  lookupTableInputsRelations,
  lookupTableOutputsRelations,
  lookupTableDimensionBinsRelations,
  lookupTableCellsRelations,
  LookupTableStatus,
} from "./lookup_table";
import {
  rule_sets,
  rule_set_steps,
  ruleSetsRelations,
  ruleSetStepsRelations,
} from "./rule_set";
import {
  test_scenarios,
  testScenariosRelations,
} from "./test_scenario";
import {
  providers,
} from "./provider";

export {
  templates,
  templatesRelations,
  models,
  model_metrics,
  inferences,
  modelGroups,
  modelGroupMemberships,
  workflows,
  nodes,
  edges,
  workflowRunHistory,
  nodesRelations,
  edgesRelations,
  endpoints,
  widgets,
  workflowsRelations,
  endpointsRelations,
  widgetsRelations,
  rules,
  rule_flows,
  condition_groups,
  conditions,
  rule_flow_actions,
  rulesRelations,
  ruleFlowsRelations,
  conditionGroupsRelations,
  conditionsRelations,
  ruleFlowActionsRelations,
  modelsRelations,
  model_metricsRelations,
  inferencesRelations,
  modelGroupsRelations,
  modelGroupMembershipsRelations,
  decision_tables,
  decision_table_rows,
  decision_table_inputs,
  decision_table_outputs,
  decision_table_input_conditions,
  decision_table_output_results,
  decisionTablesRelations,
  decisionTableRowsRelations,
  decisionTableInputsRelations,
  decisionTableOutputsRelations,
  decisionTableInputConditionsRelations,
  decisionTableOutputResultsRelations,
  knowledge_bases,
  knowledge_base_documents,
  knowledge_base_chunks,
  conversations,
  conversation_messages,
  knowledgeBaseRelations,
  knowledgeBaseDocumentRelations,
  knowledgeBaseChunkRelations,
  knowledgeBaseConversationRelations,
  conversationRelations,
  conversationMessageRelations,
  users,
  orgs,
  userOrgs,
  usersRelations,
  orgsRelations,
  userOrgsRelations,
  roles,
  permissions,
  rolePermissions,
  userRoles,
  rolesRelations,
  permissionsRelations,
  rolePermissionsRelations,
  userRolesRelations,
  auditLogs,
  auditLogsRelations,
  // Decision Engine schemas
  variables,
  variablesRelations,
  // N-dimensional lookup tables
  lookup_tables,
  lookup_table_inputs,
  lookup_table_outputs,
  lookup_table_dimension_bins,
  lookup_table_cells,
  lookupTablesRelations,
  lookupTableInputsRelations,
  lookupTableOutputsRelations,
  lookupTableDimensionBinsRelations,
  lookupTableCellsRelations,
  LookupTableStatus,
  rule_sets,
  rule_set_steps,
  ruleSetsRelations,
  ruleSetStepsRelations,
  test_scenarios,
  testScenariosRelations,
  providers,
};

export default {
  templates,
  workflows,
  endpoints,
  widgets,
  nodes,
  edges,
  workflowRunHistory,
  nodesRelations,
  edgesRelations,
  workflowsRelations,
  endpointsRelations,
  widgetsRelations,
  rules,
  rule_flows,
  condition_groups,
  conditions,
  rule_flow_actions,
  rulesRelations,
  ruleFlowsRelations,
  conditionGroupsRelations,
  conditionsRelations,
  ruleFlowActionsRelations,
  models,
  model_metrics,
  inferences,
  modelsRelations,
  model_metricsRelations,
  inferencesRelations,
  decision_tables,
  decision_table_rows,
  decision_table_inputs,
  decision_table_outputs,
  decision_table_input_conditions,
  decision_table_output_results,
  decisionTableInputConditionsRelations,
  decisionTableOutputResultsRelations,
  decisionTablesRelations,
  decisionTableRowsRelations,
  decisionTableInputsRelations,
  decisionTableOutputsRelations,
  knowledge_bases,
  knowledge_base_documents,
  knowledge_base_chunks,
  knowledgeBaseRelations,
  knowledgeBaseDocumentRelations,
  knowledgeBaseChunkRelations,
  conversations,
  conversation_messages,
  knowledgeBaseConversationRelations,
  conversationRelations,
  conversationMessageRelations,
  users,
  orgs,
  userOrgs,
  usersRelations,
  orgsRelations,
  userOrgsRelations,
  roles,
  permissions,
  rolePermissions,
  userRoles,
  rolesRelations,
  permissionsRelations,
  rolePermissionsRelations,
  userRolesRelations,
  auditLogs,
  auditLogsRelations,
  // Decision Engine schemas
  variables,
  variablesRelations,
  // N-dimensional lookup tables
  lookup_tables,
  lookup_table_inputs,
  lookup_table_outputs,
  lookup_table_dimension_bins,
  lookup_table_cells,
  lookupTablesRelations,
  lookupTableInputsRelations,
  lookupTableOutputsRelations,
  lookupTableDimensionBinsRelations,
  lookupTableCellsRelations,
  LookupTableStatus,
  rule_sets,
  rule_set_steps,
  ruleSetsRelations,
  ruleSetStepsRelations,
  test_scenarios,
  testScenariosRelations,
  providers,
};
