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
ALTER TABLE "decision_tables" DROP CONSTRAINT "dt_tenant_name_unique";--> statement-breakpoint
ALTER TABLE "rule_sets" DROP CONSTRAINT "rule_set_tenant_name_unique";--> statement-breakpoint
ALTER TABLE "variables" DROP CONSTRAINT "variable_tenant_name_unique";--> statement-breakpoint
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "decision_tables" DROP CONSTRAINT "decision_tables_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "knowledge_bases" DROP CONSTRAINT "knowledge_bases_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP CONSTRAINT "lookup_tables_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "models" DROP CONSTRAINT "models_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "rule_sets" DROP CONSTRAINT "rule_sets_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "rules" DROP CONSTRAINT "rules_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "test_scenarios" DROP CONSTRAINT "test_scenarios_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "variables" DROP CONSTRAINT "variables_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "workflows" DROP CONSTRAINT "workflows_tenant_id_tenants_id_fk";
--> statement-breakpoint
DROP INDEX "audit_logs_tenant_id_idx";--> statement-breakpoint
DROP INDEX "dt_tenant_id_idx";--> statement-breakpoint
DROP INDEX "knowledge_base_tenant_id_idx";--> statement-breakpoint
DROP INDEX "cells_tenant_id_idx";--> statement-breakpoint
DROP INDEX "dimension_bins_tenant_id_idx";--> statement-breakpoint
DROP INDEX "lookup_tables_tenant_name_idx";--> statement-breakpoint
DROP INDEX "lookup_tables_tenant_id_idx";--> statement-breakpoint
DROP INDEX "model_tenant_id_idx";--> statement-breakpoint
DROP INDEX "rule_set_tenant_id_idx";--> statement-breakpoint
DROP INDEX "rule_tenant_id_idx";--> statement-breakpoint
DROP INDEX "test_scenario_tenant_id_idx";--> statement-breakpoint
DROP INDEX "user_roles_tenant_id_idx";--> statement-breakpoint
DROP INDEX "variable_tenant_id_idx";--> statement-breakpoint
DROP INDEX "workflow_tenant_id_idx";--> statement-breakpoint
DROP INDEX "lookup_inputs_tenant_id_idx";--> statement-breakpoint
DROP INDEX "lookup_outputs_tenant_id_idx";--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_tenant_id_role_id_pk";--> statement-breakpoint
ALTER TABLE "lookup_table_cells" ALTER COLUMN "input_coordinates" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lookup_table_cells" ALTER COLUMN "output_values" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_org_id_role_id_pk" PRIMARY KEY("user_id","org_id","role_id");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "org_id" integer;--> statement-breakpoint
ALTER TABLE "decision_tables" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "knowledge_bases" ADD COLUMN "org_id" integer;--> statement-breakpoint
ALTER TABLE "lookup_table_cells" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "lookup_table_cells" ADD COLUMN "row_1_bin_id" integer;--> statement-breakpoint
ALTER TABLE "lookup_table_cells" ADD COLUMN "row_2_bin_id" integer;--> statement-breakpoint
ALTER TABLE "lookup_table_cells" ADD COLUMN "output_value" text;--> statement-breakpoint
ALTER TABLE "lookup_table_dimension_bins" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "lookup_table_dimension_bins" ADD COLUMN "dimension" integer;--> statement-breakpoint
ALTER TABLE "lookup_tables" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "rule_sets" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "rules" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "test_scenarios" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "variables" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "lookup_table_inputs" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "lookup_table_outputs" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "org_data" jsonb DEFAULT '{"currentOrgId": null, "orgs": []}';--> statement-breakpoint
ALTER TABLE "user_orgs" ADD CONSTRAINT "user_orgs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_orgs" ADD CONSTRAINT "user_orgs_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orgs_id_idx" ON "orgs" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "orgs_uuid_idx" ON "orgs" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "orgs_slug_idx" ON "orgs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "user_orgs_user_id_idx" ON "user_orgs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_orgs_org_id_idx" ON "user_orgs" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_orgs_user_org_unique" ON "user_orgs" USING btree ("user_id","org_id");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_tables" ADD CONSTRAINT "decision_tables_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lookup_tables" ADD CONSTRAINT "lookup_tables_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_sets_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_scenarios" ADD CONSTRAINT "test_scenarios_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variables" ADD CONSTRAINT "variables_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_org_id_idx" ON "audit_logs" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "dt_org_id_idx" ON "decision_tables" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "knowledge_base_org_id_idx" ON "knowledge_bases" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "cells_org_id_idx" ON "lookup_table_cells" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "dimension_bins_org_id_idx" ON "lookup_table_dimension_bins" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lookup_tables_org_name_idx" ON "lookup_tables" USING btree ("org_id","name");--> statement-breakpoint
CREATE INDEX "lookup_tables_org_id_idx" ON "lookup_tables" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "model_org_id_idx" ON "models" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "rule_set_org_id_idx" ON "rule_sets" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "rule_org_id_idx" ON "rules" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "test_scenario_org_id_idx" ON "test_scenarios" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "user_roles_org_id_idx" ON "user_roles" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "variable_org_id_idx" ON "variables" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "workflow_org_id_idx" ON "workflows" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "lookup_inputs_org_id_idx" ON "lookup_table_inputs" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "lookup_outputs_org_id_idx" ON "lookup_table_outputs" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "users_v2_org_data_gin_idx" ON "users" USING gin ("org_data");--> statement-breakpoint
ALTER TABLE "audit_logs" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "decision_tables" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "knowledge_bases" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "lookup_table_cells" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "lookup_table_dimension_bins" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "rule_sets" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "rules" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "test_scenarios" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "user_roles" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "variables" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "workflows" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "lookup_table_inputs" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "lookup_table_outputs" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "decision_tables" ADD CONSTRAINT "dt_org_name_unique" UNIQUE("org_id","name");--> statement-breakpoint
ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_set_org_name_unique" UNIQUE("org_id","name");--> statement-breakpoint
ALTER TABLE "variables" ADD CONSTRAINT "variable_org_name_unique" UNIQUE("org_id","name");