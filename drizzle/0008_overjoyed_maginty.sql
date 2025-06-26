-- Migration 0008: Clean up tenant system and enhance users table
DO $$ 
BEGIN
    -- Disable row level security only for tables that exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
        ALTER TABLE "tenants" DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_tenants') THEN
        ALTER TABLE "user_tenants" DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Drop tables only if they exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
        DROP TABLE "tenants" CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_tenants') THEN
        DROP TABLE "user_tenants" CASCADE;
    END IF;
    
    -- Drop old user indexes only if they exist
    DROP INDEX IF EXISTS "users_id_idx";
    DROP INDEX IF EXISTS "users_uuid_idx";
    DROP INDEX IF EXISTS "users_email_idx";
    
    -- Add org_data column to users table if it exists and doesn't already have the column
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'org_data') THEN
        ALTER TABLE "users" ADD COLUMN "org_data" jsonb DEFAULT '{"currentOrgId": null, "orgs": []}';
    END IF;
    
    -- Create new user indexes only if users table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE INDEX IF NOT EXISTS "users_v2_id_idx" ON "users" USING btree ("id");
        CREATE UNIQUE INDEX IF NOT EXISTS "users_v2_uuid_idx" ON "users" USING btree ("uuid");
        CREATE UNIQUE INDEX IF NOT EXISTS "users_v2_email_idx" ON "users" USING btree ("email");
        CREATE INDEX IF NOT EXISTS "users_v2_org_data_gin_idx" ON "users" USING gin ("org_data");
    END IF;
END $$;