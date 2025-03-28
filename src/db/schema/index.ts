import { templates } from "./n8n";
import { models, model_metrics, modelsRelations } from "./model";
import { workflows, workflowsRelations } from "./workflow";
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

export {
  templates,
  models,
  model_metrics,
  workflows,
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
  modelsRelations
};

export default {
  templates,
  workflows,
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
  models,
  model_metrics,
  modelsRelations
};
