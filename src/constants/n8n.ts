import { param } from "drizzle-orm";

export const n8nWebhookNode = {
  type: "n8n-nodes-base.webhook",
  typeVersion: 2,
  parameters: {
    httpMethod: "",
    path: "",
    responseMode: "lastNode",
    options: {},
  },
  position: [],
  name: "",
  id: "",
  webhookId: "",
};

export const n8nHTTPRequestNode = {
  type: "n8n-nodes-base.httpRequest",
  typeVersion: 4.2,
  parameters: {
    method: "POST",
    url: "",
    options: {},
  },
  position: [],
  name: "",
  id: "",
};

export const n8nSetNodeDefaultAssignments = {
  id: "",
  name: "",
  value: "",
  type: "",
};

export const n8nSetNode = {
  type: "n8n-nodes-base.set",
  typeVersion: 3.4,
  parameters: {
    assignments: {
      assignments: [],
    },
    options: {},
  },
  position: [],
  name: "",
  id: "",
};

export const n8nSwitchNodeEmptyCondition = {
  conditions: {
    options: {
      caseSensitive: true,
      leftValue: "",
      typeValidation: "strict",
      version: 2,
    },
    conditions: [
      {
        id: "",
        leftValue: "",
        rightValue: "",
        operator: {
          type: "string",
          operation: "equals",
          name: "filter.operator.equals",
        },
      },
    ],
    combinator: "and",
  },
};

export const n8nSwitchNodeDefaultCondition = {
  conditions: {
    options: {
      caseSensitive: true,
      leftValue: "",
      typeValidation: "strict",
      version: 2,
    },
    conditions: [
      {
        leftValue: "",
        rightValue: "",
        operator: {
          type: "boolean",
          operation: "true",
          singleValue: true,
        },
        id: "",
      },
    ],
    combinator: "and",
  },
};

export const n8nSwitchNode = {
  type: "n8n-nodes-base.switch",
  typeVersion: 3.2,
  parameters: {
    rules: {
      values: [],
    },
    options: {},
  },
  position: [],
  name: "",
  id: "",
};

export const n8nIfNodeDefaultCondition = {
  id: "",
  leftValue: "",
  rightValue: "",
  operator: {
    type: "",
    operation: "",
  },
};

export const n8nIfNode = {
  type: "n8n-nodes-base.if",
  typeVersion: 3.2,
  parameters: {
    conditions: {
      options: {
        caseSensitive: true,
        leftValue: "",
        typeValidation: "strict",
        version: 2,
      },
      conditions: [],
      combinator: "and",
    },
    options: {},
  },
  position: [],
  name: "",
  id: "",
};

export const n8nCodeNode = {
  parameters: {
    jsCode: "",
  },
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [],
  id: "",
  name: "",
};

export const n8nTwilioNode = {
  parameters: {
    from: "",
    to: "",
    message: "",
    options: {},
  },
  type: "n8n-nodes-base.twilio",
  typeVersion: 1,
  position: [],
  id: "",
  name: "",
  credentials: {
    twilioApi: {
      id: process.env.N8N_TWILIO_CREDENTIALS_ID,
      name: process.env.N8N_TWILIO_CREDENTIALS_NAME,
    },
  },
};

export const n8nSplitOutNode = {
  parameters: {
    fieldToSplitOut: "",
    options: {},
  },
  type: "n8n-nodes-base.splitOut",
  typeVersion: 1,
  position: [],
  id: "",
  name: "",
};

export const n8nSplitInBatchesNode = {
  parameters: {
    options: {},
  },
  type: "n8n-nodes-base.splitInBatches",
  typeVersion: 3,
  position: [],
  id: "",
  name: "",
};
