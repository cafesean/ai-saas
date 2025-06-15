CREATE TABLE "lookup_table_rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"lookup_table_id" uuid NOT NULL,
	"input_condition" text,
	"input_value" text NOT NULL,
	"output_value" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lookup_table_rows_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "lookup_tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"input_variable_id" uuid NOT NULL,
	"output_name" varchar(255) NOT NULL,
	"output_data_type" varchar(50) NOT NULL,
	"default_value" text,
	"version" integer DEFAULT 1 NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" integer,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lookup_tables_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "lookup_table_tenant_name_unique" UNIQUE("tenant_id","name")
);
--> statement-breakpoint
CREATE TABLE "rule_set_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"rule_set_id" uuid NOT NULL,
	"step_order" integer NOT NULL,
	"step_name" varchar(255) NOT NULL,
	"artifact_type" varchar(50) NOT NULL,
	"artifact_id" uuid NOT NULL,
	"input_mapping" json,
	"output_mapping" json,
	"execution_condition" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rule_set_steps_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "rule_set_step_order_unique" UNIQUE("rule_set_id","step_order")
);
--> statement-breakpoint
CREATE TABLE "rule_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"input_schema" json,
	"output_schema" json,
	"version" integer DEFAULT 1 NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" integer,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rule_sets_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "rule_set_tenant_name_unique" UNIQUE("tenant_id","name")
);
--> statement-breakpoint
CREATE TABLE "test_scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"artifact_type" varchar(50) NOT NULL,
	"artifact_id" uuid NOT NULL,
	"input_data" json NOT NULL,
	"expected_output" json,
	"actual_output" json,
	"last_run_at" timestamp with time zone,
	"last_run_status" varchar(50),
	"tenant_id" integer NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "test_scenarios_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "variables" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"data_type" varchar(50) NOT NULL,
	"logic_type" varchar(50) NOT NULL,
	"formula" text,
	"lookup_table_id" uuid,
	"default_value" text,
	"version" integer DEFAULT 1 NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" integer,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "variables_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "variable_tenant_name_unique" UNIQUE("tenant_id","name")
);
--> statement-breakpoint
ALTER TABLE "decision_tables" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "decision_tables" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "decision_tables" ADD COLUMN "published_by" integer;--> statement-breakpoint
ALTER TABLE "lookup_table_rows" ADD CONSTRAINT "lookup_table_rows_lookup_table_id_lookup_tables_uuid_fk" FOREIGN KEY ("lookup_table_id") REFERENCES "public"."lookup_tables"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lookup_tables" ADD CONSTRAINT "lookup_tables_input_variable_id_variables_uuid_fk" FOREIGN KEY ("input_variable_id") REFERENCES "public"."variables"("uuid") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lookup_tables" ADD CONSTRAINT "lookup_tables_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rule_set_steps" ADD CONSTRAINT "rule_set_steps_rule_set_id_rule_sets_uuid_fk" FOREIGN KEY ("rule_set_id") REFERENCES "public"."rule_sets"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_sets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_scenarios" ADD CONSTRAINT "test_scenarios_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variables" ADD CONSTRAINT "variables_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lookup_table_row_id_idx" ON "lookup_table_rows" USING btree ("id");--> statement-breakpoint
CREATE INDEX "lookup_table_row_uuid_idx" ON "lookup_table_rows" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "lookup_table_row_lookup_id_idx" ON "lookup_table_rows" USING btree ("lookup_table_id");--> statement-breakpoint
CREATE INDEX "lookup_table_row_order_idx" ON "lookup_table_rows" USING btree ("order");--> statement-breakpoint
CREATE INDEX "lookup_table_id_idx" ON "lookup_tables" USING btree ("id");--> statement-breakpoint
CREATE INDEX "lookup_table_uuid_idx" ON "lookup_tables" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "lookup_table_tenant_id_idx" ON "lookup_tables" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "lookup_table_status_idx" ON "lookup_tables" USING btree ("status");--> statement-breakpoint
CREATE INDEX "rule_set_step_id_idx" ON "rule_set_steps" USING btree ("id");--> statement-breakpoint
CREATE INDEX "rule_set_step_uuid_idx" ON "rule_set_steps" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "rule_set_step_rule_set_id_idx" ON "rule_set_steps" USING btree ("rule_set_id");--> statement-breakpoint
CREATE INDEX "rule_set_step_order_idx" ON "rule_set_steps" USING btree ("step_order");--> statement-breakpoint
CREATE INDEX "rule_set_id_idx" ON "rule_sets" USING btree ("id");--> statement-breakpoint
CREATE INDEX "rule_set_uuid_idx" ON "rule_sets" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "rule_set_tenant_id_idx" ON "rule_sets" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "rule_set_status_idx" ON "rule_sets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "test_scenario_id_idx" ON "test_scenarios" USING btree ("id");--> statement-breakpoint
CREATE INDEX "test_scenario_uuid_idx" ON "test_scenarios" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "test_scenario_tenant_id_idx" ON "test_scenarios" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "test_scenario_artifact_idx" ON "test_scenarios" USING btree ("artifact_type","artifact_id");--> statement-breakpoint
CREATE INDEX "test_scenario_created_by_idx" ON "test_scenarios" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "variable_id_idx" ON "variables" USING btree ("id");--> statement-breakpoint
CREATE INDEX "variable_uuid_idx" ON "variables" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX "variable_tenant_id_idx" ON "variables" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "variable_status_idx" ON "variables" USING btree ("status");--> statement-breakpoint
CREATE INDEX "variable_logic_type_idx" ON "variables" USING btree ("logic_type");--> statement-breakpoint
CREATE INDEX "dt_version_idx" ON "decision_tables" USING btree ("version");--> statement-breakpoint
CREATE INDEX "dt_status_idx" ON "decision_tables" USING btree ("status");--> statement-breakpoint
ALTER TABLE "decision_tables" ADD CONSTRAINT "dt_tenant_name_unique" UNIQUE("tenant_id","name");