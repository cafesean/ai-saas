ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_uuid_unique";--> statement-breakpoint
ALTER TABLE "levels" DROP CONSTRAINT "levels_uuid_unique";--> statement-breakpoint
ALTER TABLE "pricing_roles" DROP CONSTRAINT "pricing_roles_uuid_unique";--> statement-breakpoint
ALTER TABLE "ratecards" DROP CONSTRAINT "ratecards_uuid_unique";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_uuid_unique";--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "uuid" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "uuid" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "uuid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "uuid" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "uuid" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "uuid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pricing_roles" ALTER COLUMN "uuid" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "pricing_roles" ALTER COLUMN "uuid" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "pricing_roles" ALTER COLUMN "uuid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "uuid" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "uuid" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "uuid" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "uuid" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "uuid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "uuid" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "uuid" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "uuid" DROP NOT NULL;