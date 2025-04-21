export const DecisionStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const DecisionTableInputConditions = [
  {
    condition: "equals",
  },
  {
    condition: "not equals",
  },
  {
    condition: "greater than",
  },
  {
    condition: "less than",
  },
  // {
  //   condition: "contains",
  // },
  // {
  //   condition: "does not contain",
  // },
  // {
  //   condition: "start with",
  // },
  // {
  //   condition: "end with",
  // },
];

export const DecisionDataTypes = [
  {
    value: "String",
  },
  {
    value: "Number",
  },
  {
    value: "Boolean",
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
  condition: DecisionTableInputConditions[0]?.condition || "",
  value: "",
};

export const DefaultDecisionTableOutputResult = {
  result: "",
};
