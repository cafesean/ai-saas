export const TemplateStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const WorkflowStatus = {
  PUBLISHED: "Published",
  PAUSED: "Paused",
  DRAFT: "Draft",
} as const;

export const WorkflowTypes = {
  STANDARD: {
    label: "Standard Workflow",
    value: "Standard",
  },
  EVENT_DRIVEN: {
    label: "Event-Driven Workflow",
    value: "Event-Driven",
  },
  SCHEDULED: {
    label: "Scheduled Workflow",
    value: "Scheduled",
  },
} as const;

export const WorkflowNodeDataActions = {
  settings: "settings",
  delete: "delete",
};

export const WorkflowRunHistoryStatus = {
  SUCCESS: "success",
  FAILURE: "failure",
  RUNNING: "running",
};

export const TriggerTypes = [
  "HTTP Request",
  "Webhook",
  "Schedule",
  "Event",
] as const;

export const TriggerHTTPMethods = ["GET", "POST", "PUT", "DELETE"] as const;

export const ModelStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const EndpointStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const WidgetStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const RuleStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const HTTPMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

export const Providers = {
  n8n: "n8n",
  langFlow: "langFlow",
} as const;

export const LocalStorageKeys = {
  googleAccessToken: "google_access_token",
} as const;

export const YOU_NAME = "You";
export const AI_SASS_NAME = "AI Sass";
export const AI_LOADING_TEXT = "Loading...";

export const S3_UPLOAD = {
  modelsPath: process.env.NEXT_PUBLIC_MODEL_S3_FOLDER || "models",
  knowledgebasePath: process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_S3_FOLDER || "knowledgebase",
  maxSize: 50 * 1024 * 1024, // 50MB
  maxProgressingBar: 90,
  completeProgressBar: 100,
};

export const EMBEDDING_DOCUMENT = {
  maxSize: 50 * 1024 * 1024, // 50MB
};
