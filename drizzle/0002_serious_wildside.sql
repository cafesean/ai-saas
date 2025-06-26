CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"action" varchar(100) NOT NULL,
	"resource" varchar(100),
	"user_id" integer,
	"tenant_id" integer,
	"ip_address" varchar(45),
	"user_agent" text,
	"details" jsonb,
	"severity" varchar(20) DEFAULT 'INFO' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_logs_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"category" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "permissions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"user_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_tenant_id_role_id_pk" PRIMARY KEY("user_id","tenant_id","role_id")
);
--> statement-breakpoint
-- Conditionally alter knowledge_bases table if tenant_id column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_bases' AND column_name = 'tenant_id') THEN
        ALTER TABLE "knowledge_bases" ALTER COLUMN "tenant_id" DROP NOT NULL;
    END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_id_idx" ON "audit_logs" USING btree ("id");--> statement-breakpoint
CREATE INDEX "audit_logs_uuid_idx" ON "audit_logs" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "permissions_id_idx" ON "permissions" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_uuid_idx" ON "permissions" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_slug_idx" ON "permissions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "permissions_category_idx" ON "permissions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "roles_id_idx" ON "roles" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_uuid_idx" ON "roles" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_roles_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_roles_tenant_id_idx" ON "user_roles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "user_roles_role_id_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "user_roles_assigned_by_idx" ON "user_roles" USING btree ("assigned_by");

-- Seed RBAC permissions data
-- This section seeds all permissions from the permissions catalog
INSERT INTO permissions (slug, name, description, category) VALUES
-- Workflow Permissions
('workflow:create', 'Create Workflow', 'Create new workflows', 'workflow'),
('workflow:read', 'View Workflow', 'View workflow details and structure', 'workflow'),
('workflow:update', 'Edit Workflow', 'Edit existing workflows', 'workflow'),
('workflow:delete', 'Delete Workflow', 'Delete workflows', 'workflow'),
('workflow:publish', 'Publish Workflow', 'Publish workflows to production', 'workflow'),
('workflow:execute', 'Execute Workflow', 'Trigger workflow execution', 'workflow'),
('workflow:manage_templates', 'Manage Templates', 'Manage workflow templates including Twilio message templates', 'workflow'),
('workflow:configure_integrations', 'Configure Integrations', 'Configure external integrations like Twilio, webhooks, and third-party services', 'workflow'),
('workflow:parse', 'Parse Workflow', 'Parse and process workflow templates', 'workflow'),

-- Model Permissions
('model:create', 'Create Model', 'Upload and create new AI models', 'model'),
('model:read', 'View Model', 'View model details and metadata', 'model'),
('model:update', 'Edit Model', 'Edit model metadata and configuration', 'model'),
('model:delete', 'Delete Model', 'Delete AI models', 'model'),
('model:deploy', 'Deploy Model', 'Deploy models to production endpoints', 'model'),
('model:inference', 'Run Inference', 'Execute model inference requests', 'model'),

-- Provider Permissions
('provider:create', 'Create Provider', 'Register new LLM providers and configure their settings', 'provider'),
('provider:read', 'View Provider', 'View provider configurations and status', 'provider'),
('provider:update', 'Edit Provider', 'Update provider configurations and settings', 'provider'),
('provider:delete', 'Delete Provider', 'Remove provider configurations', 'provider'),
('provider:test', 'Test Provider', 'Test provider connections and health status', 'provider'),
('provider:health', 'Monitor Provider Health', 'View provider health metrics and status monitoring', 'provider'),

-- Decision Table Permissions
('rules:create', 'Create Rules', 'Create new decision tables and rules', 'rules'),
('rules:read', 'View Rules', 'View decision table structure and rules', 'rules'),
('rules:update', 'Edit Rules', 'Edit decision table rules and conditions', 'rules'),
('rules:delete', 'Delete Rules', 'Delete decision tables and rules', 'rules'),
('rules:publish', 'Publish Rules', 'Publish decision tables to production', 'rules'),
('rules:test', 'Test Rules', 'Execute test cases against decision tables', 'rules'),

-- Rule Permissions
('rule:create', 'Create Rule', 'Create new business rules', 'rule'),
('rule:read', 'View Rule', 'View rule definitions and logic', 'rule'),
('rule:update', 'Edit Rule', 'Edit business rule logic and conditions', 'rule'),
('rule:delete', 'Delete Rule', 'Delete business rules', 'rule'),
('rule:publish', 'Publish Rule', 'Publish rules to production', 'rule'),

-- Knowledge Base Permissions
('bases:create', 'Create Knowledge Bases', 'Create new knowledge bases', 'bases'),
('bases:read', 'View Knowledge Bases', 'Access knowledge base content', 'bases'),
('bases:update', 'Edit Knowledge Bases', 'Edit knowledge base content and settings', 'bases'),
('bases:delete', 'Delete Knowledge Bases', 'Delete knowledge bases', 'bases'),
('bases:upload_document', 'Upload Documents', 'Upload documents to knowledge bases', 'bases'),
('bases:chat', 'Chat with Knowledge Bases', 'Use chat interface with knowledge bases', 'bases'),
('bases:callback', 'Knowledge Base Callbacks', 'Process knowledge base document callbacks', 'bases'),

-- Decision Engine Variable Permissions
('decisioning:variable:create', 'Create Variable', 'Create new decision variables', 'decisioning'),
('decisioning:variable:read', 'View Variable', 'View variable definitions and configurations', 'decisioning'),
('decisioning:variable:update', 'Edit Variable', 'Edit variable logic and configurations', 'decisioning'),
('decisioning:variable:delete', 'Delete Variable', 'Delete decision variables', 'decisioning'),
('decisioning:variable:publish', 'Publish Variable', 'Publish variables to make them available for use', 'decisioning'),
('decisioning:variable:deprecate', 'Deprecate Variable', 'Deprecate published variables', 'decisioning'),

-- Decision Engine Lookup Table Permissions
('decisioning:lookup:create', 'Create Lookup Table', 'Create new lookup tables', 'decisioning'),
('decisioning:lookup:read', 'View Lookup Table', 'View lookup table structure and mappings', 'decisioning'),
('decisioning:lookup:update', 'Edit Lookup Table', 'Edit lookup table mappings and configurations', 'decisioning'),
('decisioning:lookup:delete', 'Delete Lookup Table', 'Delete lookup tables', 'decisioning'),
('decisioning:lookup:publish', 'Publish Lookup Table', 'Publish lookup tables to make them available for use', 'decisioning'),
('decisioning:lookup:deprecate', 'Deprecate Lookup Table', 'Deprecate published lookup tables', 'decisioning'),

-- Decision Engine Rule Set Permissions
('decisioning:ruleset:create', 'Create Rule Set', 'Create new rule sets for orchestrating decision logic', 'decisioning'),
('decisioning:ruleset:read', 'View Rule Set', 'View rule set configurations and step mappings', 'decisioning'),
('decisioning:ruleset:update', 'Edit Rule Set', 'Edit rule set steps and orchestration logic', 'decisioning'),
('decisioning:ruleset:delete', 'Delete Rule Set', 'Delete rule sets', 'decisioning'),
('decisioning:ruleset:publish', 'Publish Rule Set', 'Publish rule sets to make them available for execution', 'decisioning'),
('decisioning:ruleset:deprecate', 'Deprecate Rule Set', 'Deprecate published rule sets', 'decisioning'),

-- Decision Engine Testing Permissions
('decisioning:test:create', 'Create Test Scenario', 'Create test scenarios for decision artifacts', 'decisioning'),
('decisioning:test:read', 'View Test Scenario', 'View test scenarios and test results', 'decisioning'),
('decisioning:test:update', 'Edit Test Scenario', 'Edit test scenarios and expected outcomes', 'decisioning'),
('decisioning:test:delete', 'Delete Test Scenario', 'Delete test scenarios', 'decisioning'),
('decisioning:test:execute', 'Execute Tests', 'Run test scenarios against decision artifacts', 'decisioning'),

-- User Management Permissions
('users:create', 'Create Users', 'Create new user accounts', 'users'),
('users:read', 'View Users', 'View user profiles and information', 'users'),
('users:update', 'Edit Users', 'Edit user profiles and information', 'users'),
('users:delete', 'Delete Users', 'Delete user accounts', 'users'),
('users:assign_roles', 'Assign User Roles', 'Assign and remove roles from users', 'users'),

-- Role Management Permissions
('roles:read', 'View Roles', 'View roles and their permissions', 'roles'),
('roles:create', 'Create Roles', 'Create new roles', 'roles'),
('roles:update', 'Edit Roles', 'Edit role information and settings', 'roles'),
('roles:delete', 'Delete Roles', 'Delete roles (except system roles)', 'roles'),
('roles:assign_permissions', 'Manage Role Permissions', 'Assign and remove permissions from roles', 'roles'),

-- Organization Management Permissions
('orgs:create', 'Create Organizations', 'Create new organizations', 'orgs'),
('orgs:read', 'View Organizations', 'View organization information and settings', 'orgs'),
('orgs:update', 'Edit Organizations', 'Edit organization settings and configuration', 'orgs'),
('orgs:delete', 'Delete Organizations', 'Delete organizations', 'orgs'),

-- Administrative Permissions
('admin:full_access', 'Full Administrative Access', 'Complete administrative privileges across all system functions', 'admin'),
('admin:system_settings', 'System Settings', 'Access and modify system-wide settings', 'admin'),
('admin:audit_logs', 'View Audit Logs', 'Access system audit logs and security events', 'admin'),
('admin:role_management', 'Role Management', 'Create, edit, and delete system roles', 'admin'),
('admin:permission_management', 'Permission Management', 'Manage system permissions and access control', 'admin'),
('admin:debug_context', 'Debug Context Access', 'Access system debug information and context data', 'admin'),
('admin:seed_rbac', 'Seed RBAC System', 'Initialize and modify the RBAC system structure', 'admin'),
('admin:seed_orgs', 'Seed Org System', 'Initialize and modify org organizational structure', 'admin'),

-- Widget and Endpoint Permissions
('widget:create', 'Create Widget', 'Create embeddable widgets', 'widget'),
('widget:read', 'View Widget', 'View widget configuration and code', 'widget'),
('widget:update', 'Edit Widget', 'Edit widget configuration', 'widget'),
('widget:delete', 'Delete Widget', 'Delete widgets', 'widget'),
('endpoint:create', 'Create Endpoint', 'Create API endpoints', 'endpoint'),
('endpoint:read', 'View Endpoint', 'View endpoint configuration and logs', 'endpoint'),
('endpoint:update', 'Edit Endpoint', 'Edit endpoint configuration', 'endpoint'),
('endpoint:delete', 'Delete Endpoint', 'Delete API endpoints', 'endpoint'),
('endpoint:execute', 'Execute Endpoint', 'Execute API endpoint workflows', 'endpoint'),

-- File Management Permissions
('file:upload', 'Upload Files', 'Upload files to the system', 'file'),
('file:read', 'View Files', 'View and download files', 'file'),
('file:delete', 'Delete Files', 'Delete files from the system', 'file'),
('file:download', 'Download Files', 'Download files from the system', 'file'),
('file:manage_s3', 'Manage S3 Storage', 'Direct access to S3 storage operations', 'file'),
('file:google_drive', 'Google Drive Access', 'Access Google Drive files and operations', 'file'),

-- Deprecated Twilio Permissions
('twilio:templates', 'Twilio Templates (DEPRECATED)', 'Access Twilio message templates. DEPRECATED: Use workflow:manage_templates instead.', 'twilio')
ON CONFLICT (slug) DO NOTHING;

-- Seed default roles
INSERT INTO roles (name, description, is_system_role) VALUES
('Admin', 'Full system administrator with all permissions', true),
('Analyst', 'Business analyst with workflow, rule, and decision table management', true),
('Developer', 'Developer with model and technical resource management', true),
('Viewer', 'Read-only access to most resources', true)
ON CONFLICT (name) DO NOTHING;

-- Seed role-permission mappings
-- Admin role gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Analyst role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Analyst'
AND p.slug IN (
    'workflow:create', 'workflow:read', 'workflow:update', 'workflow:delete', 'workflow:publish', 'workflow:execute',
    'workflow:manage_templates', 'workflow:configure_integrations', 'workflow:parse',
    'rules:create', 'rules:read', 'rules:update', 'rules:delete', 'rules:publish', 'rules:test',
    'rule:create', 'rule:read', 'rule:update', 'rule:delete', 'rule:publish',
    'bases:create', 'bases:read', 'bases:update', 'bases:upload_document', 'bases:chat', 'bases:callback',
    'model:read', 'model:inference', 'users:read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Developer role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Developer'
AND p.slug IN (
    'model:create', 'model:read', 'model:update', 'model:delete', 'model:deploy', 'model:inference',
    'provider:create', 'provider:read', 'provider:update', 'provider:delete', 'provider:test', 'provider:health',
    'workflow:create', 'workflow:read', 'workflow:update', 'workflow:delete', 'workflow:publish', 'workflow:execute',
    'workflow:manage_templates', 'workflow:configure_integrations', 'workflow:parse',
    'endpoint:create', 'endpoint:read', 'endpoint:update', 'endpoint:delete', 'endpoint:execute',
    'widget:create', 'widget:read', 'widget:update', 'widget:delete',
    'rules:read', 'rules:test', 'rule:read', 'bases:read', 'bases:chat', 'users:read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Viewer role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Viewer'
AND p.slug IN (
    'workflow:read', 'workflow:execute', 'model:read', 'model:inference',
    'provider:read', 'provider:health', 'rules:read', 'rules:test', 'rule:read',
    'bases:read', 'bases:chat', 'widget:read', 'endpoint:read', 'users:read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Seed initial organization and user data
-- This section creates the initial "Acme" organization and admin user

-- Create initial organization
INSERT INTO orgs (name, description, slug, is_active) VALUES
('Acme', 'Initial organization', 'acme', true)
ON CONFLICT (slug) DO NOTHING;

-- Create initial admin user with hashed password (gYu8D-REQHq3)
-- Password hash generated with bcrypt at cost 10
WITH org_info AS (
    SELECT id as org_id FROM orgs WHERE slug = 'acme' LIMIT 1
)
INSERT INTO users (name, email, password, is_active, org_data)
SELECT 
    'Test User',
    'admin@jetdevs.com',
    '$2b$10$IUE33emJJGJf.RmtO28baOpLVGSGam0xPMPaWGSkN/C.a/ioYYRxy', -- hashed: gYu8D-REQHq3
    true,
    jsonb_build_object(
        'currentOrgId', org_info.org_id,
        'orgs', jsonb_build_array(
            jsonb_build_object(
                'role', 'admin',
                'orgId', org_info.org_id,
                'isActive', true,
                'joinedAt', '2025-06-16T00:09:26.408491+08:00'
            )
        )
    )
FROM org_info
ON CONFLICT (email) DO NOTHING;

-- Assign admin role to initial user in initial org
-- Note: This references the updated table structure after tenant-to-org migration
WITH user_org_info AS (
    SELECT 
        u.id as user_id,
        o.id as org_id,
        r.id as role_id
    FROM users u
    CROSS JOIN orgs o
    CROSS JOIN roles r
    WHERE u.email = 'admin@jetdevs.com'
    AND o.slug = 'acme'
    AND r.name = 'Admin'
    LIMIT 1
)
INSERT INTO user_roles (user_id, tenant_id, role_id, is_active, assigned_by)
SELECT 
    user_id,
    org_id,  -- Note: This assumes tenant_id maps to org_id after migration
    role_id,
    true,
    user_id  -- Self-assigned for initial admin
FROM user_org_info
ON CONFLICT (user_id, tenant_id, role_id) DO NOTHING;