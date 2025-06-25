DROP INDEX "providers_org_id_idx";--> statement-breakpoint
DROP INDEX "providers_provider_id_org_unique";--> statement-breakpoint
ALTER TABLE "providers" DROP COLUMN "org_id";--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_provider_id_unique" UNIQUE("provider_id");