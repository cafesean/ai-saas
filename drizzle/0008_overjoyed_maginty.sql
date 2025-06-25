ALTER TABLE "tenants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_tenants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "tenants" CASCADE;--> statement-breakpoint
DROP TABLE "user_tenants" CASCADE;--> statement-breakpoint
DROP INDEX "users_id_idx";--> statement-breakpoint
DROP INDEX "users_uuid_idx";--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "org_data" jsonb DEFAULT '{"currentOrgId": null, "orgs": []}';--> statement-breakpoint
CREATE INDEX "users_v2_id_idx" ON "users" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_v2_uuid_idx" ON "users" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "users_v2_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_v2_org_data_gin_idx" ON "users" USING gin ("org_data");