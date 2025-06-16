CREATE TABLE "lookup_table_cells" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"lookup_table_id" integer NOT NULL,
	"row_1_bin_id" integer NOT NULL,
	"row_2_bin_id" integer,
	"output_value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lookup_table_cells_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "lookup_table_dimension_bins" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"lookup_table_id" integer NOT NULL,
	"dimension" integer NOT NULL,
	"bin_index" integer NOT NULL,
	"label" varchar(255) NOT NULL,
	"bin_type" varchar(50) NOT NULL,
	"exact_value" text,
	"range_min" numeric(15, 6),
	"range_max" numeric(15, 6),
	"is_min_inclusive" boolean DEFAULT true,
	"is_max_inclusive" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lookup_table_dimension_bins_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "lookup_table_rows" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "lookup_table_rows" CASCADE;--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP CONSTRAINT "lookup_table_tenant_name_unique";--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP CONSTRAINT "lookup_tables_input_variable_id_variables_uuid_fk";
--> statement-breakpoint
DROP INDEX "lookup_table_id_idx";--> statement-breakpoint
DROP INDEX "lookup_table_uuid_idx";--> statement-breakpoint
DROP INDEX "lookup_table_tenant_id_idx";--> statement-breakpoint
DROP INDEX "lookup_table_status_idx";--> statement-breakpoint
ALTER TABLE "lookup_tables" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "lookup_tables" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "lookup_tables" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "lookup_tables" ADD COLUMN "output_variable_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "lookup_tables" ADD COLUMN "input_variable_1_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "lookup_tables" ADD COLUMN "input_variable_2_id" integer;--> statement-breakpoint
ALTER TABLE "lookup_tables" ADD COLUMN "created_by" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "lookup_tables" ADD COLUMN "updated_by" integer NOT NULL;--> statement-breakpoint
CREATE INDEX "cells_lookup_table_idx" ON "lookup_table_cells" USING btree ("lookup_table_id");--> statement-breakpoint
CREATE INDEX "cells_tenant_id_idx" ON "lookup_table_cells" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "dimension_bins_lookup_table_idx" ON "lookup_table_dimension_bins" USING btree ("lookup_table_id");--> statement-breakpoint
CREATE INDEX "dimension_bins_tenant_id_idx" ON "lookup_table_dimension_bins" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lookup_tables_tenant_name_idx" ON "lookup_tables" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE INDEX "lookup_tables_tenant_id_idx" ON "lookup_tables" USING btree ("tenant_id");--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP COLUMN "input_variable_id";--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP COLUMN "output_name";--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP COLUMN "output_data_type";--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP COLUMN "default_value";--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP COLUMN "published_at";--> statement-breakpoint
ALTER TABLE "lookup_tables" DROP COLUMN "published_by";