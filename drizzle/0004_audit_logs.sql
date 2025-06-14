-- Create audit_logs table for tracking security events and permission denials
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"action" varchar(100) NOT NULL,
	"resource" varchar(100),
	"user_id" integer,
	"tenant_id" integer,
	"ip_address" varchar(45),
	"user_agent" text,
	"details" jsonb,
	"severity" varchar(20) DEFAULT 'INFO' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_logs_uuid_unique" UNIQUE("uuid")
);

-- Create indexes for audit_logs table
CREATE INDEX IF NOT EXISTS "audit_logs_id_idx" ON "audit_logs" USING btree ("id");
CREATE INDEX IF NOT EXISTS "audit_logs_uuid_idx" ON "audit_logs" USING btree ("uuid");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" USING btree ("action");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_idx" ON "audit_logs" USING btree ("tenant_id");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_severity_idx" ON "audit_logs" USING btree ("severity");

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$; 