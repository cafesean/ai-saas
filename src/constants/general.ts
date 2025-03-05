export const TemplateStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const WorkflowStatus = {
  ACTIVE: "Active",
  PENDING: "Pending",
  INACTIVE: "Inactive",
} as const;

export const EndpointStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const WidgetStatus = {
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
  n8n: 'n8n',
  langFlow: 'langFlow',
} as const;

export const LocalStorageKeys = {
  googleAccessToken: 'google_access_token',
} as const;
