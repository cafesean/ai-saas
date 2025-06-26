DROP INDEX "providers_org_id_idx";--> statement-breakpoint
DROP INDEX "providers_provider_id_org_unique";--> statement-breakpoint
ALTER TABLE "providers" DROP COLUMN "org_id";--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_provider_id_unique" UNIQUE("provider_id");--> statement-breakpoint

-- Seed Provider Permissions
INSERT INTO "permissions" ("slug", "name", "description", "category", "created_at", "updated_at") 
VALUES 
  ('provider:create', 'Create Provider', 'Register new LLM providers and configure their settings', 'provider', NOW(), NOW()),
  ('provider:read', 'View Provider', 'View provider configurations and status', 'provider', NOW(), NOW()),
  ('provider:update', 'Edit Provider', 'Update provider configurations and settings', 'provider', NOW(), NOW()),
  ('provider:delete', 'Delete Provider', 'Remove provider configurations', 'provider', NOW(), NOW()),
  ('provider:test', 'Test Provider', 'Test provider connections and health status', 'provider', NOW(), NOW()),
  ('provider:health', 'Monitor Provider Health', 'View provider health metrics and status monitoring', 'provider', NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "updated_at" = NOW();--> statement-breakpoint

-- Assign Provider Permissions to Roles
-- Admin role gets all provider permissions (already has them via ALL_PERMISSIONS)
-- Developer role gets all provider permissions
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.name = 'Developer' 
  AND p.slug IN ('provider:create', 'provider:read', 'provider:update', 'provider:delete', 'provider:test', 'provider:health')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permissions" rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );--> statement-breakpoint

-- Viewer role gets read and health provider permissions
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.name = 'Viewer' 
  AND p.slug IN ('provider:read', 'provider:health')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permissions" rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );