export const RuleTypes = {
  flow: "flow",
  conditionGroup: "conditionGroup",
  condition: "condition",
};

export const RuleGroupLogicalOperators = {
  AND: "AND",
  OR: "OR",
};

export const RuleOperators = [
  {
    label: "is smaller than",
    operator: "<"
  },
  {
    label: "is equal with",
    operator: "=="
  },
  {
    label: "is larger than",
    operator: ">"
  },
];

export const ConditionDataTypes = {
  string: "string",
  number: "number",
  boolean: "boolean"
};

export const RuleFlowActionTypes = [
  {
    label: "Text",
    value: "text",
  },
]