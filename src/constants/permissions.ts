/**
 * RBAC Permissions Catalog
 * 
 * This file serves as the single source of truth for all permission slugs in the system.
 * Each permission follows the format: "{resource}:{action}"
 * 
 * Categories:
 * - workflow: Workflow management permissions
 * - model: AI Model management permissions
 * - decision_table: Decision table management permissions
 * - rule: Business rule management permissions
 * - knowledge_base: Knowledge base management permissions
 * - admin: Administrative permissions
 * - tenant: Tenant management permissions
 * - user: User management permissions
 */

export interface Permission {
  slug: string;
  name: string;
  description: string;
  category: string;
}

// Workflow Permissions
export const WORKFLOW_PERMISSIONS: Permission[] = [
  {
    slug: "workflow:create",
    name: "Create Workflow",
    description: "Create new workflows",
    category: "workflow",
  },
  {
    slug: "workflow:read",
    name: "View Workflow",
    description: "View workflow details and structure",
    category: "workflow",
  },
  {
    slug: "workflow:update",
    name: "Edit Workflow",
    description: "Edit existing workflows",
    category: "workflow",
  },
  {
    slug: "workflow:delete",
    name: "Delete Workflow",
    description: "Delete workflows",
    category: "workflow",
  },
  {
    slug: "workflow:publish",
    name: "Publish Workflow",
    description: "Publish workflows to production",
    category: "workflow",
  },
  {
    slug: "workflow:execute",
    name: "Execute Workflow",
    description: "Trigger workflow execution",
    category: "workflow",
  },
  {
    slug: "workflow:manage_templates",
    name: "Manage Templates",
    description: "Manage workflow templates including Twilio message templates",
    category: "workflow",
  },
  {
    slug: "workflow:configure_integrations",
    name: "Configure Integrations",
    description: "Configure external integrations like Twilio, webhooks, and third-party services",
    category: "workflow",
  },
];

// Model Permissions
export const MODEL_PERMISSIONS: Permission[] = [
  {
    slug: "model:create",
    name: "Create Model",
    description: "Upload and create new AI models",
    category: "model",
  },
  {
    slug: "model:read",
    name: "View Model",
    description: "View model details and metadata",
    category: "model",
  },
  {
    slug: "model:update",
    name: "Edit Model",
    description: "Edit model metadata and configuration",
    category: "model",
  },
  {
    slug: "model:delete",
    name: "Delete Model",
    description: "Delete AI models",
    category: "model",
  },
  {
    slug: "model:deploy",
    name: "Deploy Model",
    description: "Deploy models to production endpoints",
    category: "model",
  },
  {
    slug: "model:inference",
    name: "Run Inference",
    description: "Execute model inference requests",
    category: "model",
  },
];

// Decision Table Permissions
export const DECISION_TABLE_PERMISSIONS: Permission[] = [
  {
    slug: "decision_table:create",
    name: "Create Decision Table",
    description: "Create new decision tables",
    category: "decision_table",
  },
  {
    slug: "decision_table:read",
    name: "View Decision Table",
    description: "View decision table structure and rules",
    category: "decision_table",
  },
  {
    slug: "decision_table:update",
    name: "Edit Decision Table",
    description: "Edit decision table rules and conditions",
    category: "decision_table",
  },
  {
    slug: "decision_table:delete",
    name: "Delete Decision Table",
    description: "Delete decision tables",
    category: "decision_table",
  },
  {
    slug: "decision_table:publish",
    name: "Publish Decision Table",
    description: "Publish decision tables to production",
    category: "decision_table",
  },
  {
    slug: "decision_table:test",
    name: "Test Decision Table",
    description: "Execute test cases against decision tables",
    category: "decision_table",
  },
];

// Rule Permissions
export const RULE_PERMISSIONS: Permission[] = [
  {
    slug: "rule:create",
    name: "Create Rule",
    description: "Create new business rules",
    category: "rule",
  },
  {
    slug: "rule:read",
    name: "View Rule",
    description: "View rule definitions and logic",
    category: "rule",
  },
  {
    slug: "rule:update",
    name: "Edit Rule",
    description: "Edit business rule logic and conditions",
    category: "rule",
  },
  {
    slug: "rule:delete",
    name: "Delete Rule",
    description: "Delete business rules",
    category: "rule",
  },
  {
    slug: "rule:publish",
    name: "Publish Rule",
    description: "Publish rules to production",
    category: "rule",
  },
];

// Knowledge Base Permissions
export const KNOWLEDGE_BASE_PERMISSIONS: Permission[] = [
  {
    slug: "knowledge_base:create",
    name: "Create Knowledge Base",
    description: "Create new knowledge bases",
    category: "knowledge_base",
  },
  {
    slug: "knowledge_base:read",
    name: "View Knowledge Base",
    description: "Access knowledge base content",
    category: "knowledge_base",
  },
  {
    slug: "knowledge_base:update",
    name: "Edit Knowledge Base",
    description: "Edit knowledge base content and settings",
    category: "knowledge_base",
  },
  {
    slug: "knowledge_base:delete",
    name: "Delete Knowledge Base",
    description: "Delete knowledge bases",
    category: "knowledge_base",
  },
  {
    slug: "knowledge_base:upload_document",
    name: "Upload Documents",
    description: "Upload documents to knowledge bases",
    category: "knowledge_base",
  },
  {
    slug: "knowledge_base:chat",
    name: "Chat with Knowledge Base",
    description: "Use chat interface with knowledge bases",
    category: "knowledge_base",
  },
  {
    slug: "knowledge_base:callback",
    name: "Knowledge Base Callback",
    description: "Process knowledge base document callbacks",
    category: "knowledge_base",
  },
];

// Decision Engine Variable Permissions
export const VARIABLE_PERMISSIONS: Permission[] = [
  {
    slug: "decisioning:variable:create",
    name: "Create Variable",
    description: "Create new decision variables",
    category: "decisioning",
  },
  {
    slug: "decisioning:variable:read",
    name: "View Variable",
    description: "View variable definitions and configurations",
    category: "decisioning",
  },
  {
    slug: "decisioning:variable:update",
    name: "Edit Variable",
    description: "Edit variable logic and configurations",
    category: "decisioning",
  },
  {
    slug: "decisioning:variable:delete",
    name: "Delete Variable",
    description: "Delete decision variables",
    category: "decisioning",
  },
  {
    slug: "decisioning:variable:publish",
    name: "Publish Variable",
    description: "Publish variables to make them available for use",
    category: "decisioning",
  },
  {
    slug: "decisioning:variable:deprecate",
    name: "Deprecate Variable",
    description: "Deprecate published variables",
    category: "decisioning",
  },
];

// Decision Engine Lookup Table Permissions
export const LOOKUP_TABLE_PERMISSIONS: Permission[] = [
  {
    slug: "decisioning:lookup:create",
    name: "Create Lookup Table",
    description: "Create new lookup tables",
    category: "decisioning",
  },
  {
    slug: "decisioning:lookup:read",
    name: "View Lookup Table",
    description: "View lookup table structure and mappings",
    category: "decisioning",
  },
  {
    slug: "decisioning:lookup:update",
    name: "Edit Lookup Table",
    description: "Edit lookup table mappings and configurations",
    category: "decisioning",
  },
  {
    slug: "decisioning:lookup:delete",
    name: "Delete Lookup Table",
    description: "Delete lookup tables",
    category: "decisioning",
  },
  {
    slug: "decisioning:lookup:publish",
    name: "Publish Lookup Table",
    description: "Publish lookup tables to make them available for use",
    category: "decisioning",
  },
  {
    slug: "decisioning:lookup:deprecate",
    name: "Deprecate Lookup Table",
    description: "Deprecate published lookup tables",
    category: "decisioning",
  },
];

// Decision Engine Rule Set Permissions
export const RULE_SET_PERMISSIONS: Permission[] = [
  {
    slug: "decisioning:ruleset:create",
    name: "Create Rule Set",
    description: "Create new rule sets for orchestrating decision logic",
    category: "decisioning",
  },
  {
    slug: "decisioning:ruleset:read",
    name: "View Rule Set",
    description: "View rule set configurations and step mappings",
    category: "decisioning",
  },
  {
    slug: "decisioning:ruleset:update",
    name: "Edit Rule Set",
    description: "Edit rule set steps and orchestration logic",
    category: "decisioning",
  },
  {
    slug: "decisioning:ruleset:delete",
    name: "Delete Rule Set",
    description: "Delete rule sets",
    category: "decisioning",
  },
  {
    slug: "decisioning:ruleset:publish",
    name: "Publish Rule Set",
    description: "Publish rule sets to make them available for execution",
    category: "decisioning",
  },
  {
    slug: "decisioning:ruleset:deprecate",
    name: "Deprecate Rule Set",
    description: "Deprecate published rule sets",
    category: "decisioning",
  },
];

// Decision Engine Testing Permissions
export const DECISION_TESTING_PERMISSIONS: Permission[] = [
  {
    slug: "decisioning:test:create",
    name: "Create Test Scenario",
    description: "Create test scenarios for decision artifacts",
    category: "decisioning",
  },
  {
    slug: "decisioning:test:read",
    name: "View Test Scenario",
    description: "View test scenarios and test results",
    category: "decisioning",
  },
  {
    slug: "decisioning:test:update",
    name: "Edit Test Scenario",
    description: "Edit test scenarios and expected outcomes",
    category: "decisioning",
  },
  {
    slug: "decisioning:test:delete",
    name: "Delete Test Scenario",
    description: "Delete test scenarios",
    category: "decisioning",
  },
  {
    slug: "decisioning:test:execute",
    name: "Execute Tests",
    description: "Run test scenarios against decision artifacts",
    category: "decisioning",
  },
];

// User Management Permissions
export const USER_PERMISSIONS: Permission[] = [
  {
    slug: "users:create",
    name: "Create Users",
    description: "Create new user accounts",
    category: "users",
  },
  {
    slug: "users:read",
    name: "View Users",
    description: "View user profiles and information",
    category: "users",
  },
  {
    slug: "users:update",
    name: "Edit Users",
    description: "Edit user profiles and information",
    category: "users",
  },
  {
    slug: "users:delete",
    name: "Delete Users",
    description: "Delete user accounts",
    category: "users",
  },
  {
    slug: "users:assign_roles",
    name: "Assign User Roles",
    description: "Assign and remove roles from users",
    category: "users",
  },
];

// Role Management Permissions
export const ROLE_PERMISSIONS: Permission[] = [
  {
    slug: "roles:read",
    name: "View Roles",
    description: "View roles and their permissions",
    category: "roles",
  },
  {
    slug: "roles:create",
    name: "Create Roles",
    description: "Create new roles",
    category: "roles",
  },
  {
    slug: "roles:update",
    name: "Edit Roles",
    description: "Edit role information and settings",
    category: "roles",
  },
  {
    slug: "roles:delete",
    name: "Delete Roles",
    description: "Delete roles (except system roles)",
    category: "roles",
  },
  {
    slug: "roles:assign_permissions",
    name: "Manage Role Permissions",
    description: "Assign and remove permissions from roles",
    category: "roles",
  },
];

// Tenant Management Permissions
export const TENANT_PERMISSIONS: Permission[] = [
  {
    slug: "tenant:create",
    name: "Create Tenant",
    description: "Create new tenant organizations",
    category: "tenant",
  },
  {
    slug: "tenant:read",
    name: "View Tenant",
    description: "View tenant information and settings",
    category: "tenant",
  },
  {
    slug: "tenant:update",
    name: "Edit Tenant",
    description: "Edit tenant settings and configuration",
    category: "tenant",
  },
  {
    slug: "tenant:delete",
    name: "Delete Tenant",
    description: "Delete tenant organizations",
    category: "tenant",
  },
];

// Administrative Permissions
export const ADMIN_PERMISSIONS: Permission[] = [
  {
    slug: "admin:full_access",
    name: "Full Administrative Access",
    description: "Complete administrative privileges across all system functions",
    category: "admin",
  },
  {
    slug: "admin:system_settings",
    name: "System Settings",
    description: "Access and modify system-wide settings",
    category: "admin",
  },
  {
    slug: "admin:audit_logs",
    name: "View Audit Logs",
    description: "Access system audit logs and security events",
    category: "admin",
  },
  {
    slug: "admin:role_management",
    name: "Role Management",
    description: "Create, edit, and delete system roles",
    category: "admin",
  },
  {
    slug: "admin:permission_management",
    name: "Permission Management",
    description: "Manage system permissions and access control",
    category: "admin",
  },
];

// Widget and Endpoint Permissions
export const WIDGET_PERMISSIONS: Permission[] = [
  {
    slug: "widget:create",
    name: "Create Widget",
    description: "Create embeddable widgets",
    category: "widget",
  },
  {
    slug: "widget:read",
    name: "View Widget",
    description: "View widget configuration and code",
    category: "widget",
  },
  {
    slug: "widget:update",
    name: "Edit Widget",
    description: "Edit widget configuration",
    category: "widget",
  },
  {
    slug: "widget:delete",
    name: "Delete Widget",
    description: "Delete widgets",
    category: "widget",
  },
];

export const ENDPOINT_PERMISSIONS: Permission[] = [
  {
    slug: "endpoint:create",
    name: "Create Endpoint",
    description: "Create API endpoints",
    category: "endpoint",
  },
  {
    slug: "endpoint:read",
    name: "View Endpoint",
    description: "View endpoint configuration and logs",
    category: "endpoint",
  },
  {
    slug: "endpoint:update",
    name: "Edit Endpoint",
    description: "Edit endpoint configuration",
    category: "endpoint",
  },
  {
    slug: "endpoint:delete",
    name: "Delete Endpoint",
    description: "Delete API endpoints",
    category: "endpoint",
  },
  {
    slug: "endpoint:execute",
    name: "Execute Endpoint",
    description: "Execute API endpoint workflows",
    category: "endpoint",
  },
];

// File Management Permissions
export const FILE_PERMISSIONS: Permission[] = [
  {
    slug: "file:upload",
    name: "Upload Files",
    description: "Upload files to the system",
    category: "file",
  },
  {
    slug: "file:read",
    name: "View Files",
    description: "View and download files",
    category: "file",
  },
  {
    slug: "file:delete",
    name: "Delete Files",
    description: "Delete files from the system",
    category: "file",
  },
  {
    slug: "file:download",
    name: "Download Files",
    description: "Download files from the system",
    category: "file",
  },
  {
    slug: "file:manage_s3",
    name: "Manage S3 Storage",
    description: "Direct access to S3 storage operations",
    category: "file",
  },
  {
    slug: "file:google_drive",
    name: "Google Drive Access",
    description: "Access Google Drive files and operations",
    category: "file",
  },
];

// Workflow Additional Permissions (extending WORKFLOW_PERMISSIONS)
export const WORKFLOW_ADDITIONAL_PERMISSIONS: Permission[] = [
  {
    slug: "workflow:parse",
    name: "Parse Workflow",
    description: "Parse and process workflow templates",
    category: "workflow",
  },
];

// Twilio Integration Permissions (DEPRECATED)
// These permissions are deprecated and will be removed in a future version.
// Use workflow:manage_templates and workflow:configure_integrations instead.
export const TWILIO_PERMISSIONS: Permission[] = [
  {
    slug: "twilio:templates",
    name: "Twilio Templates (DEPRECATED)",
    description: "Access Twilio message templates. DEPRECATED: Use workflow:manage_templates instead.",
    category: "twilio",
  },
];

// All permissions combined
export const ALL_PERMISSIONS: Permission[] = [
  ...WORKFLOW_PERMISSIONS,
  ...WORKFLOW_ADDITIONAL_PERMISSIONS,
  ...MODEL_PERMISSIONS,
  ...DECISION_TABLE_PERMISSIONS,
  ...RULE_PERMISSIONS,
  // Decision Engine Permissions
  ...VARIABLE_PERMISSIONS,
  ...LOOKUP_TABLE_PERMISSIONS,
  ...RULE_SET_PERMISSIONS,
  ...DECISION_TESTING_PERMISSIONS,
  ...KNOWLEDGE_BASE_PERMISSIONS,
  ...USER_PERMISSIONS,
  ...ROLE_PERMISSIONS,
  ...TENANT_PERMISSIONS,
  ...ADMIN_PERMISSIONS,
  ...WIDGET_PERMISSIONS,
  ...ENDPOINT_PERMISSIONS,
  ...FILE_PERMISSIONS,
  ...TWILIO_PERMISSIONS,
];

// Permission slugs for easy reference
export const PERMISSION_SLUGS = ALL_PERMISSIONS.map(p => p.slug);

// Default role configurations
export interface RoleConfig {
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
}

export const DEFAULT_ROLES: RoleConfig[] = [
  {
    name: "Admin",
    description: "Full system administrator with all permissions",
    permissions: PERMISSION_SLUGS, // All permissions
    isSystemRole: true,
  },
  {
    name: "Analyst",
    description: "Business analyst with workflow, rule, and decision table management",
    permissions: [
      ...WORKFLOW_PERMISSIONS.map(p => p.slug),
      ...WORKFLOW_ADDITIONAL_PERMISSIONS.map(p => p.slug),
      ...DECISION_TABLE_PERMISSIONS.map(p => p.slug),
      ...RULE_PERMISSIONS.map(p => p.slug),
      ...KNOWLEDGE_BASE_PERMISSIONS.filter(p => !p.slug.includes('delete')).map(p => p.slug),
      "model:read",
      "model:inference",
      "users:read",
    ],
    isSystemRole: true,
  },
  {
    name: "Developer",
    description: "Developer with model and technical resource management",
    permissions: [
      ...MODEL_PERMISSIONS.map(p => p.slug),
      ...WORKFLOW_PERMISSIONS.map(p => p.slug),
      ...WORKFLOW_ADDITIONAL_PERMISSIONS.map(p => p.slug),
      ...ENDPOINT_PERMISSIONS.map(p => p.slug),
      ...WIDGET_PERMISSIONS.map(p => p.slug),
      "decision_table:read",
      "decision_table:test",
      "rule:read",
      "knowledge_base:read",
      "knowledge_base:chat",
      "users:read",
    ],
    isSystemRole: true,
  },
  {
    name: "Viewer",
    description: "Read-only access to most resources",
    permissions: [
      "workflow:read",
      "workflow:execute",
      "model:read",
      "model:inference",
      "decision_table:read",
      "decision_table:test",
      "rule:read",
      "knowledge_base:read",
      "knowledge_base:chat",
      "widget:read",
      "endpoint:read",
      "users:read",
    ],
    isSystemRole: true,
  },
];

// Helper functions
export function getPermissionsByCategory(category: string): Permission[] {
  return ALL_PERMISSIONS.filter(p => p.category === category);
}

export function getPermissionBySlug(slug: string): Permission | undefined {
  return ALL_PERMISSIONS.find(p => p.slug === slug);
}

export function validatePermissionSlugs(slugs: string[]): { valid: string[], invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  for (const slug of slugs) {
    if (PERMISSION_SLUGS.includes(slug)) {
      valid.push(slug);
    } else {
      invalid.push(slug);
    }
  }
  
  return { valid, invalid };
} 