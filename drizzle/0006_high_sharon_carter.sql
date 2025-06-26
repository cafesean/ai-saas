CREATE TABLE "orgs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"slug" varchar(255),
	"logo_url" text,
	"website" text,
	"business_address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orgs_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "orgs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_orgs" (
	"user_id" integer NOT NULL,
	"org_id" integer NOT NULL,
	"role" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Drop constraints only for tables that exist
DO $$ 
BEGIN
    -- Drop unique constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'decision_tables') THEN
        ALTER TABLE "decision_tables" DROP CONSTRAINT IF EXISTS "dt_tenant_name_unique";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rule_sets') THEN
        ALTER TABLE "rule_sets" DROP CONSTRAINT IF EXISTS "rule_set_tenant_name_unique";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variables') THEN
        ALTER TABLE "variables" DROP CONSTRAINT IF EXISTS "variable_tenant_name_unique";
    END IF;
    
    -- Drop foreign key constraints only for tables that exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_tenant_id_tenants_id_fk";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'decision_tables') THEN
        ALTER TABLE "decision_tables" DROP CONSTRAINT IF EXISTS "decision_tables_tenant_id_tenants_id_fk";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_bases') THEN
        ALTER TABLE "knowledge_bases" DROP CONSTRAINT IF EXISTS "knowledge_bases_tenant_id_tenants_id_fk";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_tables') THEN
        ALTER TABLE "lookup_tables" DROP CONSTRAINT IF EXISTS "lookup_tables_tenant_id_tenants_id_fk";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'models') THEN
        ALTER TABLE "models" DROP CONSTRAINT IF EXISTS "models_tenant_id_tenants_id_fk";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rule_sets') THEN
        ALTER TABLE "rule_sets" DROP CONSTRAINT IF EXISTS "rule_sets_tenant_id_tenants_id_fk";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rules') THEN
        ALTER TABLE "rules" DROP CONSTRAINT IF EXISTS "rules_tenant_id_tenants_id_fk";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_scenarios') THEN
        ALTER TABLE "test_scenarios" DROP CONSTRAINT IF EXISTS "test_scenarios_tenant_id_tenants_id_fk";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_tenant_id_tenants_id_fk";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variables') THEN
        ALTER TABLE "variables" DROP CONSTRAINT IF EXISTS "variables_tenant_id_tenants_id_fk";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
        ALTER TABLE "workflows" DROP CONSTRAINT IF EXISTS "workflows_tenant_id_tenants_id_fk";
    END IF;
END $$;
--> statement-breakpoint

-- Drop indexes only for tables that exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        DROP INDEX IF EXISTS "audit_logs_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'decision_tables') THEN
        DROP INDEX IF EXISTS "dt_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_bases') THEN
        DROP INDEX IF EXISTS "knowledge_base_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_table_cells') THEN
        DROP INDEX IF EXISTS "cells_tenant_id_idx";
        DROP INDEX IF EXISTS "dimension_bins_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_tables') THEN
        DROP INDEX IF EXISTS "lookup_tables_tenant_name_idx";
        DROP INDEX IF EXISTS "lookup_tables_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'models') THEN
        DROP INDEX IF EXISTS "model_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rule_sets') THEN
        DROP INDEX IF EXISTS "rule_set_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rules') THEN
        DROP INDEX IF EXISTS "rule_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_scenarios') THEN
        DROP INDEX IF EXISTS "test_scenario_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        DROP INDEX IF EXISTS "user_roles_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variables') THEN
        DROP INDEX IF EXISTS "variable_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
        DROP INDEX IF EXISTS "workflow_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_table_inputs') THEN
        DROP INDEX IF EXISTS "lookup_inputs_tenant_id_idx";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_table_outputs') THEN
        DROP INDEX IF EXISTS "lookup_outputs_tenant_id_idx";
    END IF;
END $$;
--> statement-breakpoint

-- Conditionally add org_id columns and other modifications to tables that exist
DO $$ 
BEGIN
    -- Add org_id columns to existing tables only
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE "audit_logs" ADD COLUMN "org_id" integer;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'decision_tables') THEN
        ALTER TABLE "decision_tables" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_bases') THEN
        ALTER TABLE "knowledge_bases" ADD COLUMN "org_id" integer;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_table_cells') THEN
        ALTER TABLE "lookup_table_cells" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
        ALTER TABLE "lookup_table_cells" ADD COLUMN "row_1_bin_id" integer;
        ALTER TABLE "lookup_table_cells" ADD COLUMN "row_2_bin_id" integer;
        ALTER TABLE "lookup_table_cells" ADD COLUMN "output_value" text;
        ALTER TABLE "lookup_table_cells" ALTER COLUMN "input_coordinates" DROP NOT NULL;
        ALTER TABLE "lookup_table_cells" ALTER COLUMN "output_values" DROP NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_table_dimension_bins') THEN
        ALTER TABLE "lookup_table_dimension_bins" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
        ALTER TABLE "lookup_table_dimension_bins" ADD COLUMN "dimension" integer;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_tables') THEN
        ALTER TABLE "lookup_tables" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'models') THEN
        ALTER TABLE "models" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rule_sets') THEN
        ALTER TABLE "rule_sets" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rules') THEN
        ALTER TABLE "rules" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_scenarios') THEN
        ALTER TABLE "test_scenarios" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        ALTER TABLE "user_roles" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variables') THEN
        ALTER TABLE "variables" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
        ALTER TABLE "workflows" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_table_inputs') THEN
        ALTER TABLE "lookup_table_inputs" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_table_outputs') THEN
        ALTER TABLE "lookup_table_outputs" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE "users" ADD COLUMN "org_data" jsonb DEFAULT '{"currentOrgId": null, "orgs": []}';
    END IF;
    
    -- Update user_roles primary key after adding org_id column
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_user_id_tenant_id_role_id_pk";
        ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_org_id_role_id_pk" PRIMARY KEY("user_id","org_id","role_id");
    END IF;
END $$;
--> statement-breakpoint

-- Add foreign key constraints for new tables (conditionally)
DO $$ 
BEGIN
    -- Only add user_orgs foreign keys if the referenced tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE "user_orgs" ADD CONSTRAINT "user_orgs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    
    -- orgs table should exist since we just created it above
    ALTER TABLE "user_orgs" ADD CONSTRAINT "user_orgs_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;
END $$;
--> statement-breakpoint

-- Create indexes for new tables
CREATE INDEX "orgs_id_idx" ON "orgs" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "orgs_uuid_idx" ON "orgs" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "orgs_slug_idx" ON "orgs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "user_orgs_user_id_idx" ON "user_orgs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_orgs_org_id_idx" ON "user_orgs" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_orgs_user_org_unique" ON "user_orgs" USING btree ("user_id","org_id");--> statement-breakpoint

-- Add org foreign key constraints conditionally
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'decision_tables') THEN
        ALTER TABLE "decision_tables" ADD CONSTRAINT "decision_tables_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_bases') THEN
        ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_tables') THEN
        ALTER TABLE "lookup_tables" ADD CONSTRAINT "lookup_tables_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'models') THEN
        ALTER TABLE "models" ADD CONSTRAINT "models_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rule_sets') THEN
        ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_sets_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rules') THEN
        ALTER TABLE "rules" ADD CONSTRAINT "rules_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_scenarios') THEN
        ALTER TABLE "test_scenarios" ADD CONSTRAINT "test_scenarios_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variables') THEN
        ALTER TABLE "variables" ADD CONSTRAINT "variables_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
        ALTER TABLE "workflows" ADD CONSTRAINT "workflows_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint

-- Create org indexes conditionally
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        CREATE INDEX "audit_logs_org_id_idx" ON "audit_logs" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'decision_tables') THEN
        CREATE INDEX "dt_org_id_idx" ON "decision_tables" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_bases') THEN
        CREATE INDEX "knowledge_base_org_id_idx" ON "knowledge_bases" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_table_cells') THEN
        CREATE INDEX "cells_org_id_idx" ON "lookup_table_cells" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_table_dimension_bins') THEN
        CREATE INDEX "dimension_bins_org_id_idx" ON "lookup_table_dimension_bins" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_tables') THEN
        CREATE UNIQUE INDEX "lookup_tables_org_name_idx" ON "lookup_tables" USING btree ("org_id","name");
        CREATE INDEX "lookup_tables_org_id_idx" ON "lookup_tables" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'models') THEN
        CREATE INDEX "model_org_id_idx" ON "models" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rule_sets') THEN
        CREATE INDEX "rule_set_org_id_idx" ON "rule_sets" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rules') THEN
        CREATE INDEX "rule_org_id_idx" ON "rules" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_scenarios') THEN
        CREATE INDEX "test_scenario_org_id_idx" ON "test_scenarios" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        CREATE INDEX "user_roles_org_id_idx" ON "user_roles" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variables') THEN
        CREATE INDEX "variable_org_id_idx" ON "variables" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
        CREATE INDEX "workflow_org_id_idx" ON "workflows" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_table_inputs') THEN
        CREATE INDEX "lookup_inputs_org_id_idx" ON "lookup_table_inputs" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lookup_table_outputs') THEN
        CREATE INDEX "lookup_outputs_org_id_idx" ON "lookup_table_outputs" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE INDEX "users_v2_org_data_gin_idx" ON "users" USING gin ("org_data");
    END IF;
END $$;
--> statement-breakpoint

-- Drop tenant_id columns from existing tables only
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'tenant_id') THEN
        ALTER TABLE "audit_logs" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'decision_tables' AND column_name = 'tenant_id') THEN
        ALTER TABLE "decision_tables" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_bases' AND column_name = 'tenant_id') THEN
        ALTER TABLE "knowledge_bases" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lookup_table_cells' AND column_name = 'tenant_id') THEN
        ALTER TABLE "lookup_table_cells" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lookup_table_dimension_bins' AND column_name = 'tenant_id') THEN
        ALTER TABLE "lookup_table_dimension_bins" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lookup_tables' AND column_name = 'tenant_id') THEN
        ALTER TABLE "lookup_tables" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'models' AND column_name = 'tenant_id') THEN
        ALTER TABLE "models" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rule_sets' AND column_name = 'tenant_id') THEN
        ALTER TABLE "rule_sets" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rules' AND column_name = 'tenant_id') THEN
        ALTER TABLE "rules" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_scenarios' AND column_name = 'tenant_id') THEN
        ALTER TABLE "test_scenarios" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'tenant_id') THEN
        ALTER TABLE "user_roles" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'variables' AND column_name = 'tenant_id') THEN
        ALTER TABLE "variables" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflows' AND column_name = 'tenant_id') THEN
        ALTER TABLE "workflows" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lookup_table_inputs' AND column_name = 'tenant_id') THEN
        ALTER TABLE "lookup_table_inputs" DROP COLUMN "tenant_id";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lookup_table_outputs' AND column_name = 'tenant_id') THEN
        ALTER TABLE "lookup_table_outputs" DROP COLUMN "tenant_id";
    END IF;
END $$;
--> statement-breakpoint

-- Add new unique constraints
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'decision_tables') THEN
        ALTER TABLE "decision_tables" ADD CONSTRAINT "dt_org_name_unique" UNIQUE("org_id","name");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rule_sets') THEN
        ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_set_org_name_unique" UNIQUE("org_id","name");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variables') THEN
        ALTER TABLE "variables" ADD CONSTRAINT "variable_org_name_unique" UNIQUE("org_id","name");
    END IF;
END $$;