export const CreateflowActionTypes = {
  config: "config",
  trigger: "trigger",
  generateEndpoint: "generateEndpoint",
  generateWidget: "generateWidget",
};

export const CreateflowActions = [
  {
    name: "Config Workflow",
    type: CreateflowActionTypes.config,
  },
  {
    name: "Trigger Workflow",
    type: CreateflowActionTypes.trigger,
  },
  {
    name: "Generate Endpoint",
    type: CreateflowActionTypes.generateEndpoint,
  },
  {
    name: "Generate Widget",
    type: CreateflowActionTypes.generateWidget,
  },
];

export const FlowNameTypes = {
  webhookInputFormData: "Webhook Input FormData",
  webhookInputJson: "Webhook Input JSON",
  windowBufferMemory: "Window Buffer Memory",
};

export const WidgetTypes = {
  chat: 'chat',
};

export const Widgets = {
  chat: {
    name: 'Chat Widget',
    type: WidgetTypes.chat,
    scriptsPath: 'widgets_generation/chat/script.html'
  },
};

export const NodeTypes = {
  trigger: "trigger",
  aiModel: "aiModel",
  rules: "rules",
  logic: "logic",
  database: "database",
  webhook: "webhook",
  decisionTable: "decisionTable",
}
