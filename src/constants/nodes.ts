export const CreateflowActionTypes = {
  config: "config",
  trigger: "trigger",
  generateEndpoint: "generateEndpoint",
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
];

export const FlowNameTypes = {
  webhookInputFormData: "Webhook Input FormData",
  webhookInputJson: "Webhook Input JSON",
  windowBufferMemory: "Window Buffer Memory",
};
