-- Manual N-Dimensional Lookup Table Migration
-- Handles sequence conflicts and applies N-dimensional structure

-- Step 1: Add new columns to existing tables without sequence conflicts
ALTER TABLE "lookup_tables" ADD COLUMN IF NOT EXISTS "created_by" integer;
ALTER TABLE "lookup_tables" ADD COLUMN IF NOT EXISTS "updated_by" integer;

-- Step 2: Add N-dimensional coordinate columns to cells table  
ALTER TABLE "lookup_table_cells" ADD COLUMN IF NOT EXISTS "input_coordinates" json;
ALTER TABLE "lookup_table_cells" ADD COLUMN IF NOT EXISTS "output_values" json;

-- Step 3: Add dimension_order to bins table
ALTER TABLE "lookup_table_dimension_bins" ADD COLUMN IF NOT EXISTS "dimension_order" integer;

-- Step 4: Create new N-dimensional tables if they don't exist
CREATE TABLE IF NOT EXISTS "lookup_table_inputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"lookup_table_id" integer NOT NULL,
	"variable_id" integer NOT NULL,
	"dimension_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lookup_table_inputs_uuid_unique" UNIQUE("uuid")
);

CREATE TABLE IF NOT EXISTS "lookup_table_outputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" integer NOT NULL,
	"lookup_table_id" integer NOT NULL,
	"variable_id" integer NOT NULL,
	"output_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lookup_table_outputs_uuid_unique" UNIQUE("uuid")
);

-- Step 5: Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add lookup_table_inputs constraints
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'lookup_table_inputs_lookup_table_id_lookup_tables_id_fk') THEN
        ALTER TABLE "lookup_table_inputs" 
        ADD CONSTRAINT "lookup_table_inputs_lookup_table_id_lookup_tables_id_fk" 
        FOREIGN KEY ("lookup_table_id") REFERENCES "public"."lookup_tables"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'lookup_table_inputs_variable_id_variables_id_fk') THEN
        ALTER TABLE "lookup_table_inputs" 
        ADD CONSTRAINT "lookup_table_inputs_variable_id_variables_id_fk" 
        FOREIGN KEY ("variable_id") REFERENCES "public"."variables"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
    
    -- Add lookup_table_outputs constraints
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'lookup_table_outputs_lookup_table_id_lookup_tables_id_fk') THEN
        ALTER TABLE "lookup_table_outputs" 
        ADD CONSTRAINT "lookup_table_outputs_lookup_table_id_lookup_tables_id_fk" 
        FOREIGN KEY ("lookup_table_id") REFERENCES "public"."lookup_tables"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'lookup_table_outputs_variable_id_variables_id_fk') THEN
        ALTER TABLE "lookup_table_outputs" 
        ADD CONSTRAINT "lookup_table_outputs_variable_id_variables_id_fk" 
        FOREIGN KEY ("variable_id") REFERENCES "public"."variables"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
END $$;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS "lookup_inputs_lookup_table_idx" ON "lookup_table_inputs" USING btree ("lookup_table_id");
CREATE INDEX IF NOT EXISTS "lookup_inputs_tenant_id_idx" ON "lookup_table_inputs" USING btree ("tenant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "lookup_inputs_unique_dimension_idx" ON "lookup_table_inputs" USING btree ("lookup_table_id","dimension_order");

CREATE INDEX IF NOT EXISTS "lookup_outputs_lookup_table_idx" ON "lookup_table_outputs" USING btree ("lookup_table_id");
CREATE INDEX IF NOT EXISTS "lookup_outputs_tenant_id_idx" ON "lookup_table_outputs" USING btree ("tenant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "lookup_outputs_unique_output_idx" ON "lookup_table_outputs" USING btree ("lookup_table_id","output_order");

-- Step 7: Update dimension_bins to use dimension_order where missing
UPDATE "lookup_table_dimension_bins" 
SET "dimension_order" = "dimension" 
WHERE "dimension_order" IS NULL AND "dimension" IS NOT NULL;

-- Step 8: Set default values for new NOT NULL columns where needed
-- (We'll handle this in the application layer for now to avoid data loss)

-- Migration complete - N-dimensional structure is now available
-- Router can be updated to use new tables: lookup_table_inputs, lookup_table_outputs
-- Existing data preserved in original format, new tables ready for N-dimensional data 