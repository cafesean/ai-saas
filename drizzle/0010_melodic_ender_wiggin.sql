-- Migration: 0010_melodic_ender_wiggin
-- Add enhanced model metadata columns and indexes

-- CONDITIONAL: Only alter models table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'models') THEN
        -- Add new columns to models table
        ALTER TABLE "models" ADD COLUMN "provider" varchar(50);
        ALTER TABLE "models" ADD COLUMN "architecture" varchar(100);
        ALTER TABLE "models" ADD COLUMN "capabilities" json;
        ALTER TABLE "models" ADD COLUMN "model_info" json;
        ALTER TABLE "models" ADD COLUMN "training_info" json;
        ALTER TABLE "models" ADD COLUMN "performance_metrics" json;
        ALTER TABLE "models" ADD COLUMN "provider_config" json;
        ALTER TABLE "models" ADD COLUMN "enhanced_input_schema" json;
        ALTER TABLE "models" ADD COLUMN "enhanced_output_schema" json;
        
        -- Create indexes on new columns
        CREATE INDEX IF NOT EXISTS "model_provider_idx" ON "models" USING btree ("provider");
        CREATE INDEX IF NOT EXISTS "model_architecture_idx" ON "models" USING btree ("architecture");
    END IF;
END $$;