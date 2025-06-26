-- CREATE USERS TABLE
-- Base users table creation that was missing from the migration sequence
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"username" varchar(255),
	"password" text,
	"avatar" text,
	"phone" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"session_timeout_preference" integer DEFAULT 1440,
	"org_data" jsonb DEFAULT '{"currentOrgId": null, "orgs": []}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

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
CREATE TABLE IF NOT EXISTS "decision_tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"input_data" json,
	"output_data" json,
	"logic" json,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "decision_tables_uuid_unique" UNIQUE("uuid")
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
-- Note: Foreign key constraints for users and orgs will be added in later migrations after tables are created
-- Temporarily removing these constraints to allow RBAC tables to be created first
-- ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_orgs_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."orgs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Note: Foreign key constraints for users and orgs will be added in later migrations after tables are created
-- ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_tenant_id_orgs_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_id_idx" ON "audit_logs" USING btree ("id");--> statement-breakpoint
CREATE INDEX "audit_logs_uuid_idx" ON "audit_logs" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs" USING btree ("severity");--> statement-breakpoint
-- Users table indexes
CREATE INDEX IF NOT EXISTS "users_id_idx" ON "users" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_uuid_idx" ON "users" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
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
CREATE INDEX "user_roles_assigned_by_idx" ON "user_roles" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "decision_tables_id_idx" ON "decision_tables" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "decision_tables_uuid_idx" ON "decision_tables" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "decision_tables_tenant_id_idx" ON "decision_tables" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "decision_tables_status_idx" ON "decision_tables" USING btree ("status");

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
-- Note: Conditional seeding - only runs if orgs table exists

-- Create initial organization (conditional on orgs table existence)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orgs') THEN
        INSERT INTO orgs (name, description, slug, is_active) VALUES
        ('Acme', 'Initial organization', 'acme', true)
        ON CONFLICT (slug) DO NOTHING;
    END IF;
END $$;

-- Create initial admin user with hashed password (gYu8D-REQHq3)
-- Password hash generated with bcrypt at cost 10
-- Note: Conditional seeding - only runs if both orgs and users tables exist

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orgs') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        
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
    END IF;
END $$;

-- Assign admin role to initial user in initial org
-- Note: This references the updated table structure after tenant-to-org migration
-- Note: Conditional seeding - only runs if all required tables exist

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orgs') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        
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
    END IF;
END $$;

-- Create missing core tables that were orphaned from 0002_young_mandroid.sql
-- These tables are required for the complete system functionality

CREATE TABLE IF NOT EXISTS "decision_table_input_conditions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"dt_row_id" uuid NOT NULL,
	"dt_input_id" uuid NOT NULL,
	"condition" text,
	"value" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "decision_table_input_conditions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "decision_table_inputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"dt_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"dataType" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "decision_table_inputs_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "decision_table_output_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"dt_row_id" uuid NOT NULL,
	"dt_output_id" uuid NOT NULL,
	"result" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "decision_table_output_results_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "decision_table_outputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"dt_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"dataType" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "decision_table_outputs_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "decision_table_rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"dt_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "decision_table_rows_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "endpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"uri" text NOT NULL,
	"method" varchar(100) DEFAULT 'POST' NOT NULL,
	"payload" json,
	"status" varchar(100) DEFAULT 'active' NOT NULL,
	"flow_uri" text NOT NULL,
	"flow_method" varchar(100) DEFAULT 'POST' NOT NULL,
	"client_id" text NOT NULL,
	"client_secret" text NOT NULL,
	"org_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "endpoints_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "condition_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"rule_flow_id" integer NOT NULL,
	"parent_group_id" integer,
	"type" varchar(200),
	"logical_operator" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conditions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"condition_group_id" integer NOT NULL,
	"field" text NOT NULL,
	"operator" text NOT NULL,
	"value" text NOT NULL,
	"type" varchar(200),
	"data_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversation_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_messages_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"kb_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "edges" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"source" varchar(200) NOT NULL,
	"target" varchar(200) NOT NULL,
	"source_handle" text,
	"target_handle" text,
	"animated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "edges_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"model_id" integer NOT NULL,
	"input" json,
	"output" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inferences_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledge_base_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"kb_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"status" varchar(100) DEFAULT 'Processing' NOT NULL,
	"size" bigint NOT NULL,
	"path" text NOT NULL,
	"chunkSize" varchar(100) DEFAULT '1000',
	"chunk_overlap" varchar(100) DEFAULT '200',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_base_documents_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledge_bases" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"vector_db" varchar(300) NOT NULL,
	"embedding_model" varchar(300) NOT NULL,
	"status" varchar(100) DEFAULT 'Draft' NOT NULL,
	"org_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_bases_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "model_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"model_id" integer NOT NULL,
	"version" varchar(100) NOT NULL,
	"ks" varchar(100),
	"auroc" varchar(100),
	"gini" varchar(100),
	"accuracy" varchar(100),
	"precision" varchar(100),
	"recall" varchar(100),
	"f1" varchar(100),
	"brier_score" varchar(100),
	"log_loss" varchar(100),
	"ks_chart" text,
	"auroc_chart" text,
	"gini_chart" text,
	"accuracy_chart" text,
	"features" json,
	"outputs" json,
	"inference" json,
	"charts_data" json,
	"feature_analysis" json,
	"model_info_details" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "model_metrics_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "models" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"file_name" varchar(200) NOT NULL,
	"file_key" varchar(200) NOT NULL,
	"metadata_file_name" varchar(200),
	"metadata_file_key" varchar(200),
	"define_inputs" json,
	"status" varchar(100) DEFAULT 'inactive' NOT NULL,
	"type" varchar(100),
	"framework" varchar(100),
	"org_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "models_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(200),
	"position" json,
	"data" json,
	"workflow_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nodes_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rule_flow_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"rule_flow_id" integer NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rule_flows" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" integer NOT NULL,
	"type" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"status" varchar(100) DEFAULT 'active' NOT NULL,
	"org_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rules_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"data" json NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"org_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "templates_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "widgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"html" text NOT NULL,
	"css" text NOT NULL,
	"js" text NOT NULL,
	"css_framework" varchar(100) DEFAULT 'tailwind' NOT NULL,
	"js_framework" varchar(100) DEFAULT 'vanilla' NOT NULL,
	"org_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "widgets_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_run_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"execution_id" varchar(200) NOT NULL,
	"status" varchar(100) NOT NULL,
	"input_data" json,
	"output_data" json,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_run_history_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"n8n_workflow_id" varchar(100),
	"is_active" boolean DEFAULT false NOT NULL,
	"org_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workflows_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "node_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" varchar(100),
	"description" text,
	"version" varchar(50),
	"codename" varchar(200),
	"properties" json,
	"icon" text,
	"subtitle" text,
	"defaults" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "node_types_uuid_unique" UNIQUE("uuid")
);