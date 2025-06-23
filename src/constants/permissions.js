"use strict";
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
 * - org: Org management permissions
 * - user: User management permissions
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROLES = exports.PERMISSION_SLUGS = exports.ALL_PERMISSIONS = exports.TWILIO_PERMISSIONS = exports.WORKFLOW_ADDITIONAL_PERMISSIONS = exports.FILE_PERMISSIONS = exports.ENDPOINT_PERMISSIONS = exports.WIDGET_PERMISSIONS = exports.ADMIN_PERMISSIONS = exports.org_PERMISSIONS = exports.USER_PERMISSIONS = exports.DECISION_TESTING_PERMISSIONS = exports.RULE_SET_PERMISSIONS = exports.LOOKUP_TABLE_PERMISSIONS = exports.VARIABLE_PERMISSIONS = exports.KNOWLEDGE_BASE_PERMISSIONS = exports.RULE_PERMISSIONS = exports.DECISION_TABLE_PERMISSIONS = exports.MODEL_PERMISSIONS = exports.WORKFLOW_PERMISSIONS = void 0;
exports.getPermissionsByCategory = getPermissionsByCategory;
exports.getPermissionBySlug = getPermissionBySlug;
exports.validatePermissionSlugs = validatePermissionSlugs;
// Workflow Permissions
exports.WORKFLOW_PERMISSIONS = [
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
exports.MODEL_PERMISSIONS = [
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
exports.DECISION_TABLE_PERMISSIONS = [
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
exports.RULE_PERMISSIONS = [
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
exports.KNOWLEDGE_BASE_PERMISSIONS = [
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
exports.VARIABLE_PERMISSIONS = [
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
exports.LOOKUP_TABLE_PERMISSIONS = [
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
exports.RULE_SET_PERMISSIONS = [
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
exports.DECISION_TESTING_PERMISSIONS = [
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
exports.USER_PERMISSIONS = [
    {
        slug: "user:create",
        name: "Create User",
        description: "Create new user accounts",
        category: "user",
    },
    {
        slug: "user:read",
        name: "View User",
        description: "View user profiles and information",
        category: "user",
    },
    {
        slug: "user:update",
        name: "Edit User",
        description: "Edit user profiles and information",
        category: "user",
    },
    {
        slug: "user:delete",
        name: "Delete User",
        description: "Delete user accounts",
        category: "user",
    },
    {
        slug: "user:assign_role",
        name: "Assign User Roles",
        description: "Assign roles to users within org",
        category: "user",
    },
];
// Org Management Permissions
exports.org_PERMISSIONS = [
    {
        slug: "org:create",
        name: "Create Org",
        description: "Create new org organizations",
        category: "org",
    },
    {
        slug: "org:read",
        name: "View Org",
        description: "View org information and settings",
        category: "org",
    },
    {
        slug: "org:update",
        name: "Edit Org",
        description: "Edit org settings and configuration",
        category: "org",
    },
    {
        slug: "org:delete",
        name: "Delete Org",
        description: "Delete org organizations",
        category: "org",
    },
];
// Administrative Permissions
exports.ADMIN_PERMISSIONS = [
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
exports.WIDGET_PERMISSIONS = [
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
exports.ENDPOINT_PERMISSIONS = [
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
exports.FILE_PERMISSIONS = [
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
exports.WORKFLOW_ADDITIONAL_PERMISSIONS = [
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
exports.TWILIO_PERMISSIONS = [
    {
        slug: "twilio:templates",
        name: "Twilio Templates (DEPRECATED)",
        description: "Access Twilio message templates. DEPRECATED: Use workflow:manage_templates instead.",
        category: "twilio",
    },
];
// All permissions combined
exports.ALL_PERMISSIONS = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], exports.WORKFLOW_PERMISSIONS, true), exports.WORKFLOW_ADDITIONAL_PERMISSIONS, true), exports.MODEL_PERMISSIONS, true), exports.DECISION_TABLE_PERMISSIONS, true), exports.RULE_PERMISSIONS, true), exports.VARIABLE_PERMISSIONS, true), exports.LOOKUP_TABLE_PERMISSIONS, true), exports.RULE_SET_PERMISSIONS, true), exports.DECISION_TESTING_PERMISSIONS, true), exports.KNOWLEDGE_BASE_PERMISSIONS, true), exports.USER_PERMISSIONS, true), exports.org_PERMISSIONS, true), exports.ADMIN_PERMISSIONS, true), exports.WIDGET_PERMISSIONS, true), exports.ENDPOINT_PERMISSIONS, true), exports.FILE_PERMISSIONS, true), exports.TWILIO_PERMISSIONS, true);
// Permission slugs for easy reference
exports.PERMISSION_SLUGS = exports.ALL_PERMISSIONS.map(function (p) { return p.slug; });
exports.DEFAULT_ROLES = [
    {
        name: "Admin",
        description: "Full system administrator with all permissions",
        permissions: exports.PERMISSION_SLUGS, // All permissions
        isSystemRole: true,
    },
    {
        name: "Analyst",
        description: "Business analyst with workflow, rule, and decision table management",
        permissions: __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], exports.WORKFLOW_PERMISSIONS.map(function (p) { return p.slug; }), true), exports.WORKFLOW_ADDITIONAL_PERMISSIONS.map(function (p) { return p.slug; }), true), exports.DECISION_TABLE_PERMISSIONS.map(function (p) { return p.slug; }), true), exports.RULE_PERMISSIONS.map(function (p) { return p.slug; }), true), exports.KNOWLEDGE_BASE_PERMISSIONS.filter(function (p) { return !p.slug.includes('delete'); }).map(function (p) { return p.slug; }), true), [
            "model:read",
            "model:inference",
            "user:read",
        ], false),
        isSystemRole: true,
    },
    {
        name: "Developer",
        description: "Developer with model and technical resource management",
        permissions: __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], exports.MODEL_PERMISSIONS.map(function (p) { return p.slug; }), true), exports.WORKFLOW_PERMISSIONS.map(function (p) { return p.slug; }), true), exports.WORKFLOW_ADDITIONAL_PERMISSIONS.map(function (p) { return p.slug; }), true), exports.ENDPOINT_PERMISSIONS.map(function (p) { return p.slug; }), true), exports.WIDGET_PERMISSIONS.map(function (p) { return p.slug; }), true), [
            "decision_table:read",
            "decision_table:test",
            "rule:read",
            "knowledge_base:read",
            "knowledge_base:chat",
            "user:read",
        ], false),
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
            "user:read",
        ],
        isSystemRole: true,
    },
];
// Helper functions
function getPermissionsByCategory(category) {
    return exports.ALL_PERMISSIONS.filter(function (p) { return p.category === category; });
}
function getPermissionBySlug(slug) {
    return exports.ALL_PERMISSIONS.find(function (p) { return p.slug === slug; });
}
function validatePermissionSlugs(slugs) {
    var valid = [];
    var invalid = [];
    for (var _i = 0, slugs_1 = slugs; _i < slugs_1.length; _i++) {
        var slug = slugs_1[_i];
        if (exports.PERMISSION_SLUGS.includes(slug)) {
            valid.push(slug);
        }
        else {
            invalid.push(slug);
        }
    }
    return { valid: valid, invalid: invalid };
}
