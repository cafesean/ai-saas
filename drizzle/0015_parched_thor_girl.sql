-- Migration: 0015_parched_thor_girl
-- Add variable_id columns and constraints to decision table inputs/outputs

-- CONDITIONAL: Only alter decision_table_inputs and decision_table_outputs if they exist
DO $$ 
BEGIN
    -- Add variable_id to decision_table_inputs if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'decision_table_inputs') THEN
        ALTER TABLE "decision_table_inputs" ADD COLUMN "variable_id" uuid NOT NULL;
        
        -- Add foreign key constraint if variables table also exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variables') THEN
            BEGIN
                ALTER TABLE "decision_table_inputs" ADD CONSTRAINT "decision_table_inputs_variable_id_variables_uuid_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."variables"("uuid") ON DELETE no action ON UPDATE no action;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END;
        END IF;
        
        -- Drop columns from decision_table_inputs
        ALTER TABLE "decision_table_inputs" DROP COLUMN IF EXISTS "name";
        ALTER TABLE "decision_table_inputs" DROP COLUMN IF EXISTS "description";
        ALTER TABLE "decision_table_inputs" DROP COLUMN IF EXISTS "dataType";
    END IF;
    
    -- Add variable_id to decision_table_outputs if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'decision_table_outputs') THEN
        ALTER TABLE "decision_table_outputs" ADD COLUMN "variable_id" uuid NOT NULL;
        
        -- Add foreign key constraint if variables table also exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variables') THEN
            BEGIN
                ALTER TABLE "decision_table_outputs" ADD CONSTRAINT "decision_table_outputs_variable_id_variables_uuid_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."variables"("uuid") ON DELETE no action ON UPDATE no action;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END;
        END IF;
        
        -- Drop columns from decision_table_outputs
        ALTER TABLE "decision_table_outputs" DROP COLUMN IF EXISTS "name";
        ALTER TABLE "decision_table_outputs" DROP COLUMN IF EXISTS "description";
        ALTER TABLE "decision_table_outputs" DROP COLUMN IF EXISTS "dataType";
    END IF;
    
    -- Add type column to decision_table_rows if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'decision_table_rows') THEN
        ALTER TABLE "decision_table_rows" ADD COLUMN "type" varchar DEFAULT 'Normal';
    END IF;
END $$;