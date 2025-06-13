-- SAAS-32: Add tenant_id to all core resources with safe backfill
-- This migration safely adds multi-tenancy support to existing data

-- Step 1: Add nullable tenant_id columns to all core resource tables
ALTER TABLE "workflows" ADD COLUMN "tenant_id" integer;
ALTER TABLE "models" ADD COLUMN "tenant_id" integer;
ALTER TABLE "rules" ADD COLUMN "tenant_id" integer;
ALTER TABLE "decision_tables" ADD COLUMN "tenant_id" integer;
ALTER TABLE "knowledge_bases" ADD COLUMN "tenant_id" integer;

-- Step 2: Create indexes for performance
CREATE INDEX "workflow_tenant_id_idx" ON "workflows" USING btree ("tenant_id");
CREATE INDEX "model_tenant_id_idx" ON "models" USING btree ("tenant_id");
CREATE INDEX "rule_tenant_id_idx" ON "rules" USING btree ("tenant_id");
CREATE INDEX "dt_tenant_id_idx" ON "decision_tables" USING btree ("tenant_id");
CREATE INDEX "knowledge_base_tenant_id_idx" ON "knowledge_bases" USING btree ("tenant_id");

-- Step 3: Insert System Tenant for backward compatibility
INSERT INTO "tenants" ("name", "description", "slug", "is_active", "created_at", "updated_at")
VALUES (
  'System Tenant',
  'Default tenant for existing resources before multi-tenancy migration',
  'system-tenant',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO NOTHING;

-- Step 4: Get the System Tenant ID and backfill all existing records
DO $$ 
DECLARE 
    system_tenant_id integer;
BEGIN
    -- Get the System Tenant ID
    SELECT id INTO system_tenant_id FROM "tenants" WHERE slug = 'system-tenant';
    
    -- Backfill all existing core resource records
    UPDATE "workflows" SET "tenant_id" = system_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "models" SET "tenant_id" = system_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "rules" SET "tenant_id" = system_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "decision_tables" SET "tenant_id" = system_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "knowledge_bases" SET "tenant_id" = system_tenant_id WHERE "tenant_id" IS NULL;
END $$;

-- Step 5: Make tenant_id columns NOT NULL after backfill
ALTER TABLE "workflows" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "models" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "rules" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "decision_tables" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "knowledge_bases" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Step 6: Add foreign key constraints
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_tenant_id_tenants_id_fk" 
    FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "models" ADD CONSTRAINT "models_tenant_id_tenants_id_fk" 
    FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "rules" ADD CONSTRAINT "rules_tenant_id_tenants_id_fk" 
    FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "decision_tables" ADD CONSTRAINT "decision_tables_tenant_id_tenants_id_fk" 
    FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_tenant_id_tenants_id_fk" 
    FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action; 