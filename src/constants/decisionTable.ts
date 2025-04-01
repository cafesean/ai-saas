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
  {
    condition: "contains",
  },
  {
    condition: "does not contain",
  },
  {
    condition: "start with",
  },
  {
    condition: "end with",
  }
];

export const DefaultDecisionTableInputs = {
  name: "input1",
  description: "Default input named input1",
  dataType: "number",
};

export const DefaultDecisionTableOutputs = {
  name: "output1",
  description: "Default output named output1",
  dataType: "number",
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
