export type OperatorType = "AND" | "OR";

export type ConditionDataType = "number" | "string" | "boolean";

export type RuleFlowActionType =
  | "text"
  | "webhook"
  | "email"
  | "sms"
  | "workflow"
  | "custom";
