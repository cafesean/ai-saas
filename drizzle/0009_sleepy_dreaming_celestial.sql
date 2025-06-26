-- Migration: 0009_sleepy_dreaming_celestial
-- Add model groups and model group memberships tables for Champion/Challenger testing

-- Create model_groups table
CREATE TABLE IF NOT EXISTS "model_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"strategy" varchar(100) DEFAULT 'champion_challenger' NOT NULL,
	"status" varchar(100) DEFAULT 'configuring' NOT NULL,
	"traffic_config" json,
	"test_metadata" json,
	"promotion_rules" json,
	"org_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create model_group_memberships table
CREATE TABLE IF NOT EXISTS "model_group_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"model_group_id" integer NOT NULL,
	"model_id" integer NOT NULL,
	"role" varchar(50) DEFAULT 'challenger' NOT NULL,
	"traffic_percentage" integer DEFAULT 0,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraints with conditional logic
DO $$ BEGIN
 ALTER TABLE "model_groups" ADD CONSTRAINT "model_groups_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "model_group_memberships" ADD CONSTRAINT "model_group_memberships_model_group_id_model_groups_id_fk" FOREIGN KEY ("model_group_id") REFERENCES "model_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CONDITIONAL: Only add foreign key to models table if models table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'models') THEN
        BEGIN
            ALTER TABLE "model_group_memberships" ADD CONSTRAINT "model_group_memberships_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE cascade ON UPDATE no action;
        EXCEPTION
            WHEN duplicate_object THEN null;
        END;
    END IF;
END $$;

-- Create indexes for model_groups
CREATE INDEX IF NOT EXISTS "model_group_id_idx" ON "model_groups" USING btree ("id");
CREATE INDEX IF NOT EXISTS "model_group_uuid_idx" ON "model_groups" USING btree ("uuid");
CREATE INDEX IF NOT EXISTS "model_group_org_id_idx" ON "model_groups" USING btree ("org_id");
CREATE INDEX IF NOT EXISTS "model_group_status_idx" ON "model_groups" USING btree ("status");

-- Create indexes for model_group_memberships
CREATE INDEX IF NOT EXISTS "model_group_membership_id_idx" ON "model_group_memberships" USING btree ("id");
CREATE INDEX IF NOT EXISTS "model_group_membership_uuid_idx" ON "model_group_memberships" USING btree ("uuid");
CREATE INDEX IF NOT EXISTS "model_group_membership_group_id_idx" ON "model_group_memberships" USING btree ("model_group_id");
CREATE INDEX IF NOT EXISTS "model_group_membership_model_id_idx" ON "model_group_memberships" USING btree ("model_id");
CREATE INDEX IF NOT EXISTS "model_group_membership_role_idx" ON "model_group_memberships" USING btree ("role");

-- Create unique constraints
ALTER TABLE "model_groups" ADD CONSTRAINT "model_groups_uuid_unique" UNIQUE("uuid");
ALTER TABLE "model_group_memberships" ADD CONSTRAINT "model_group_memberships_uuid_unique" UNIQUE("uuid");

-- Create unique index for active model group memberships
CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_model_group_membership" ON "model_group_memberships" USING btree ("model_group_id","model_id","is_active"); 