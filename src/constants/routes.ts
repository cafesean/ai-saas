export const Routes = {
  home: "/",
};

export const AdminRoutes = {
  roles: "/roles",
  ratecards: "/ratecards",
  selectTemplate: "/select-template",
};

export const AppRoutes = {
  models: "/models",
  modelRegistry: "/models/registry",
  modelDetail: "/models/:uuid",
  workflows: "/workflows",
  workflowDetail: "/workflows/:uuid",
  rules: "/rules",
  createRule: "/rules/create",
  knowledgebase: "/knowledge-bases",
  knowledgebaseDetail: "/knowledge-bases/:uuid",
  knowledgebaseChat: "/knowledge-bases/:uuid/chat",
  widgets: "/widgets",
  decisionTables: "/decisioning",
  decisionTableDetail: "/decisioning/:uuid",
  apiDocs: "/api-docs",
  contentRepo: "/content-repo",
};

export const BackendRoutes = {
  permissions: "/permissions",
};

export const DemoRoutes = {
  levels: "/levels",
  templates: "/templates",
};
