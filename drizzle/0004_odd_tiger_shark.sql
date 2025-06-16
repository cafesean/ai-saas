CREATE TABLE "lookup_table_inputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"lookup_table_id" integer NOT NULL,
	"variable_id" integer NOT NULL,
	"dimension_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lookup_table_inputs_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "lookup_table_outputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"lookup_table_id" integer NOT NULL,
	"variable_id" integer NOT NULL,
	"output_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lookup_table_outputs_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "lookup_table_cells" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "lookup_table_dimension_bins" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "lookup_tables" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "lookup_table_cells" ADD COLUMN "input_coordinates" json NOT NULL;--> statement-breakpoint
ALTER TABLE "lookup_table_cells" ADD COLUMN "output_values" json NOT NULL;--> statement-breakpoint
ALTER TABLE "lookup_table_dimension_bins" ADD COLUMN "dimension_order" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "lookup_table_inputs" ADD CONSTRAINT "lookup_table_inputs_lookup_table_id_lookup_tables_id_fk" FOREIGN KEY ("lookup_table_id") REFERENCES "public"."lookup_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lookup_table_inputs" ADD CONSTRAINT "lookup_table_inputs_variable_id_variables_id_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."variables"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lookup_table_outputs" ADD CONSTRAINT "lookup_table_outputs_lookup_table_id_lookup_tables_id_fk" FOREIGN KEY ("lookup_table_id") REFERENCES "public"."lookup_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lookup_table_outputs" ADD CONSTRAINT "lookup_table_outputs_variable_id_variables_id_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."variables"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lookup_inputs_lookup_table_idx" ON "lookup_table_inputs" USING btree ("lookup_table_id");--> statement-breakpoint
CREATE INDEX "lookup_inputs_tenant_id_idx" ON "lookup_table_inputs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lookup_inputs_unique_dimension_idx" ON "lookup_table_inputs" USING btree ("lookup_table_id","dimension_order");--> statement-breakpoint
CREATE INDEX "lookup_outputs_lookup_table_idx" ON "lookup_table_outputs" USING btree ("lookup_table_id");--> statement-breakpoint
CREATE INDEX "lookup_outputs_tenant_id_idx" ON "lookup_table_outputs" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lookup_outputs_unique_output_idx" ON "lookup_table_outputs" USING btree ("lookup_table_id","output_order");--> statement-breakpoint
ALTER TABLE "lookup_table_cells" ADD CONSTRAINT "lookup_table_cells_lookup_table_id_lookup_tables_id_fk" FOREIGN KEY ("lookup_table_id") REFERENCES "public"."lookup_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lookup_table_dimension_bins" ADD CONSTRAINT "lookup_table_dimension_bins_lookup_table_id_lookup_tables_id_fk" FOREIGN KEY ("lookup_table_id") REFERENCES "public"."lookup_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dimension_bins_dimension_order_idx" ON "lookup_table_dimension_bins" USING btree ("lookup_table_id","dimension_order");--> statement-breakpoint
ALTER TABLE "lookup_table_cells" DROP COLUMN "row_1_bin_id";--> statement-breakpoint
ALTER TABLE "lookup_table_cells" DROP COLUMN "row_2_bin_id";--> statement-breakpoint
ALTER TABLE "lookup_table_cells" DROP COLUMN "output_value";--> statement-breakpoint
ALTER TABLE "lookup_table_dimension_bins" DROP COLUMN "dimension";--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP COLUMN "output_variable_id";--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP COLUMN "input_variable_1_id";--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP COLUMN "input_variable_2_id";