CREATE TABLE "decision_table_input_conditions" (
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
CREATE TABLE "decision_table_inputs" (
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
CREATE TABLE "decision_table_output_results" (
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
CREATE TABLE "decision_table_outputs" (
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
CREATE TABLE "decision_table_rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"dt_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "decision_table_rows_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "decision_tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"status" varchar(100) DEFAULT 'active' NOT NULL,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "decision_tables_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "endpoints" (
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "endpoints_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "condition_groups" (
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
CREATE TABLE "conditions" (
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
CREATE TABLE "conversation_messages" (
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
CREATE TABLE "conversations" (
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
CREATE TABLE "edges" (
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
CREATE TABLE "inferences" (
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
CREATE TABLE "knowledge_base_documents" (
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
CREATE TABLE "knowledge_bases" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"vector_db" varchar(300) NOT NULL,
	"embedding_model" varchar(300) NOT NULL,
	"status" varchar(100) DEFAULT 'Draft' NOT NULL,
	"tenant_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_bases_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "model_metrics" (
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
CREATE TABLE "models" (
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
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "models_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "nodes" (
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
CREATE TABLE "permissions" (
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
CREATE TABLE "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "rule_flow_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"rule_flow_id" integer NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rule_flows" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" integer NOT NULL,
	"type" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"status" varchar(100) DEFAULT 'active' NOT NULL,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"flow_id" varchar(256) NOT NULL,
	"provider" varchar(256),
	"version_id" varchar(256),
	"instance_id" varchar(256),
	"user_inputs" json,
	"workflow_json" json,
	"status" varchar(100) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
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
	CONSTRAINT "tenants_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
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
CREATE TABLE "user_tenants" (
	"user_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"role" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_tenants_user_id_tenant_id_pk" PRIMARY KEY("user_id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "widgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar(100) NOT NULL,
	"workflow_id" uuid NOT NULL,
	"status" varchar(100) DEFAULT 'active' NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "widgets_workflow_id_unique" UNIQUE("workflow_id")
);
--> statement-breakpoint
CREATE TABLE "workflow_run_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"path" varchar(200),
	"method" varchar(100),
	"payload" json,
	"response" json,
	"status" varchar(100) DEFAULT 'running' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_run_history_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"user_inputs" json,
	"workflow_json" json,
	"flow_id" varchar(200),
	"status" varchar(100) DEFAULT 'Draft' NOT NULL,
	"type" varchar(100),
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workflows_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "node_types" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(256) NOT NULL,
	"category" varchar(256) NOT NULL,
	"description" varchar(1024),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "group" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "group_policy" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "level_rates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "level_roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "levels" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "org" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "org_user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pricing_roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pricings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ratecards" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "role_policy" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "group" CASCADE;--> statement-breakpoint
DROP TABLE "group_policy" CASCADE;--> statement-breakpoint
DROP TABLE "level_rates" CASCADE;--> statement-breakpoint
DROP TABLE "level_roles" CASCADE;--> statement-breakpoint
DROP TABLE "levels" CASCADE;--> statement-breakpoint
DROP TABLE "org" CASCADE;--> statement-breakpoint
DROP TABLE "org_user" CASCADE;--> statement-breakpoint
DROP TABLE "pricing_roles" CASCADE;--> statement-breakpoint
DROP TABLE "pricings" CASCADE;--> statement-breakpoint
DROP TABLE "ratecards" CASCADE;--> statement-breakpoint
DROP TABLE "role_policy" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "uuid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "is_system_role" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "decision_table_input_conditions" ADD CONSTRAINT "dt_input_condition_dt_row_id_fkey" FOREIGN KEY ("dt_row_id") REFERENCES "public"."decision_table_rows"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_table_input_conditions" ADD CONSTRAINT "dt_input_condition_dt_input_id_fkey" FOREIGN KEY ("dt_input_id") REFERENCES "public"."decision_table_inputs"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_table_inputs" ADD CONSTRAINT "decision_table_inputs_dt_id_decision_tables_uuid_fk" FOREIGN KEY ("dt_id") REFERENCES "public"."decision_tables"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_table_output_results" ADD CONSTRAINT "dt_output_result_dt_row_id_fkey" FOREIGN KEY ("dt_row_id") REFERENCES "public"."decision_table_rows"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_table_output_results" ADD CONSTRAINT "dt_output_result_dt_output_id_fkey" FOREIGN KEY ("dt_output_id") REFERENCES "public"."decision_table_outputs"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_table_outputs" ADD CONSTRAINT "decision_table_outputs_dt_id_decision_tables_uuid_fk" FOREIGN KEY ("dt_id") REFERENCES "public"."decision_tables"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_table_rows" ADD CONSTRAINT "decision_table_rows_dt_id_decision_tables_uuid_fk" FOREIGN KEY ("dt_id") REFERENCES "public"."decision_tables"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_tables" ADD CONSTRAINT "decision_tables_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endpoints" ADD CONSTRAINT "endpoints_workflow_id_workflows_uuid_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "condition_groups" ADD CONSTRAINT "condition_groups_rule_flow_id_rule_flows_id_fk" FOREIGN KEY ("rule_flow_id") REFERENCES "public"."rule_flows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conditions" ADD CONSTRAINT "conditions_condition_group_id_condition_groups_id_fk" FOREIGN KEY ("condition_group_id") REFERENCES "public"."condition_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversation_id_conversations_uuid_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_kb_id_knowledge_bases_uuid_fk" FOREIGN KEY ("kb_id") REFERENCES "public"."knowledge_bases"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edges" ADD CONSTRAINT "edges_workflow_id_workflows_uuid_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inferences" ADD CONSTRAINT "inferences_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_base_documents" ADD CONSTRAINT "knowledge_base_documents_kb_id_knowledge_bases_uuid_fk" FOREIGN KEY ("kb_id") REFERENCES "public"."knowledge_bases"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_metrics" ADD CONSTRAINT "model_metrics_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_workflow_id_workflows_uuid_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rule_flow_actions" ADD CONSTRAINT "rule_flow_actions_rule_flow_id_rule_flows_id_fk" FOREIGN KEY ("rule_flow_id") REFERENCES "public"."rule_flows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rule_flows" ADD CONSTRAINT "rule_flows_rule_id_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_run_history" ADD CONSTRAINT "workflow_run_history_workflow_id_workflows_uuid_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dt_input_condition_id_idx" ON "decision_table_input_conditions" USING btree ("id");--> statement-breakpoint
CREATE INDEX "dt_input_condition_uuid_idx" ON "decision_table_input_conditions" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "dt_input_id_idx" ON "decision_table_inputs" USING btree ("id");--> statement-breakpoint
CREATE INDEX "dt_input_uuid_idx" ON "decision_table_inputs" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "dt_output_result_id_idx" ON "decision_table_output_results" USING btree ("id");--> statement-breakpoint
CREATE INDEX "dt_output_result_uuid_idx" ON "decision_table_output_results" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "dt_output_id_idx" ON "decision_table_outputs" USING btree ("id");--> statement-breakpoint
CREATE INDEX "dt_output_uuid_idx" ON "decision_table_outputs" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "dt_row_id_idx" ON "decision_table_rows" USING btree ("id");--> statement-breakpoint
CREATE INDEX "dt_row_uuid_idx" ON "decision_table_rows" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "dt_id_idx" ON "decision_tables" USING btree ("id");--> statement-breakpoint
CREATE INDEX "dt_uuid_idx" ON "decision_tables" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "dt_tenant_id_idx" ON "decision_tables" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "endpoint_id_idx" ON "endpoints" USING btree ("id");--> statement-breakpoint
CREATE INDEX "endpoint_uuid_idx" ON "endpoints" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "condition_groups_id_idx" ON "condition_groups" USING btree ("id");--> statement-breakpoint
CREATE INDEX "condition_groups_uuid_idx" ON "condition_groups" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "condition_id_idx" ON "conditions" USING btree ("id");--> statement-breakpoint
CREATE INDEX "condition_uuid_idx" ON "conditions" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "conversations_id_idx" ON "conversations" USING btree ("id");--> statement-breakpoint
CREATE INDEX "conversations_uuid_idx" ON "conversations" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "edge_id_idx" ON "edges" USING btree ("id");--> statement-breakpoint
CREATE INDEX "edge_uuid_idx" ON "edges" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "kb_document_id_idx" ON "knowledge_base_documents" USING btree ("id");--> statement-breakpoint
CREATE INDEX "kb_document_uuid_idx" ON "knowledge_base_documents" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "knowledge_base_id_idx" ON "knowledge_bases" USING btree ("id");--> statement-breakpoint
CREATE INDEX "knowledge_base_uuid_idx" ON "knowledge_bases" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "knowledge_base_tenant_id_idx" ON "knowledge_bases" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "model_id_idx" ON "models" USING btree ("id");--> statement-breakpoint
CREATE INDEX "model_uuid_idx" ON "models" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "model_tenant_id_idx" ON "models" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "node_id_idx" ON "nodes" USING btree ("id");--> statement-breakpoint
CREATE INDEX "node_uuid_idx" ON "nodes" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "permissions_id_idx" ON "permissions" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_uuid_idx" ON "permissions" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_slug_idx" ON "permissions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "permissions_category_idx" ON "permissions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "rule_flow_action_id_idx" ON "rule_flow_actions" USING btree ("id");--> statement-breakpoint
CREATE INDEX "rule_flow_action_uuid_idx" ON "rule_flow_actions" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "rule_flow_id_idx" ON "rule_flows" USING btree ("id");--> statement-breakpoint
CREATE INDEX "rule_flow_uuid_idx" ON "rule_flows" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "rule_id_idx" ON "rules" USING btree ("id");--> statement-breakpoint
CREATE INDEX "rule_uuid_idx" ON "rules" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "rule_tenant_id_idx" ON "rules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "template_id_idx" ON "templates" USING btree ("id");--> statement-breakpoint
CREATE INDEX "template_uuid_idx" ON "templates" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "tenants_id_idx" ON "tenants" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_uuid_idx" ON "tenants" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "user_roles_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_roles_tenant_id_idx" ON "user_roles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "user_roles_role_id_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "user_roles_assigned_by_idx" ON "user_roles" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "user_tenants_user_id_idx" ON "user_tenants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_tenants_tenant_id_idx" ON "user_tenants" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "users_id_idx" ON "users" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_uuid_idx" ON "users" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "widget_id_idx" ON "widgets" USING btree ("id");--> statement-breakpoint
CREATE INDEX "widget_uuid_idx" ON "widgets" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "workflow_run_history_id_idx" ON "workflow_run_history" USING btree ("id");--> statement-breakpoint
CREATE INDEX "workflow_run_history_uuid_idx" ON "workflow_run_history" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "workflow_id_idx" ON "workflows" USING btree ("id");--> statement-breakpoint
CREATE INDEX "workflow_uuid_idx" ON "workflows" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "workflow_tenant_id_idx" ON "workflows" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "node_type_idx" ON "node_types" USING btree ("type");--> statement-breakpoint
CREATE INDEX "node_type_category_idx" ON "node_types" USING btree ("category");--> statement-breakpoint
CREATE INDEX "node_type_id_idx" ON "node_types" USING btree ("id");--> statement-breakpoint
CREATE INDEX "node_type_uuid_idx" ON "node_types" USING btree ("id");--> statement-breakpoint
CREATE INDEX "roles_id_idx" ON "roles" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_uuid_idx" ON "roles" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");--> statement-breakpoint
ALTER TABLE "roles" DROP COLUMN "role_code";--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_uuid_unique" UNIQUE("uuid");