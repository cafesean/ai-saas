export const DecisionStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const DecisionTableInputNumberOperators = [
  {
    operator: "is equal to",
  },
  {
    operator: "is not equal to",
  },
  {
    operator: "is greater than",
  },
  {
    operator: "is less than",
  },
  {
    operator: "is greater than or equal to",
  },
  {
    operator: "is less than or equal to",
  },
]

export const DecisionTableInputStringOperators = [
  {
    operator: "exists",
  },
  {
    operator: "does not exist",
  },
  {
    operator: "is empty",
  },
  {
    operator: "is not empty",
  },
  {
    operator: "is equal to",
  },
  {
    operator: "is not equal to",
  },
  {
    operator: "contains",
  },
  {
    operator: "does not contain",
  },
];

export const DecisionTableInputBooleanOperators = [
  {
    operator: "is true",
  },
  {
    operator: "is false",
  },
  {
    operator: "is equal to",
  },
  {
    operator: "is not equal to",
  },
]

export const DecisionDataTypes = [
  {
    value: "string",
  },
  {
    value: "number",
  },
  {
    value: "boolean",
  },
  // {
  //   value: "Date",
  // },
  // {
  //   value: "Array",
  // },
  // {
  //   value: "Object",
  // },
];

export const DefaultDecisionTableInputs = {
  name: "input1",
  description: "Default input named input1",
  dataType: DecisionDataTypes[0]?.value || "",
};

export const DefaultDecisionTableOutputs = {
  name: "output1",
  description: "Default output named output1",
  dataType: DecisionDataTypes[0]?.value || "",
};

export const DefaultDecisionTableRows = {
  order: 1,
};

export const DefaultDecisionTableInputCondition = {
  condition: DecisionTableInputNumberOperators[0]?.operator || "",
  value: "",
};

export const DefaultDecisionTableOutputResult = {
  result: "",
};

export const DecisionTableRowTypes = {
  NORMAL: "Normal",
  DEFAULT: "Default",
};
