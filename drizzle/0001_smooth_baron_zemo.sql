ALTER TABLE "group" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "group_policy" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "org" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "org_user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "role_policy" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "group" CASCADE;--> statement-breakpoint
DROP TABLE "group_policy" CASCADE;--> statement-breakpoint
DROP TABLE "org" CASCADE;--> statement-breakpoint
DROP TABLE "org_user" CASCADE;--> statement-breakpoint
DROP TABLE "role_policy" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_level_id_fkey";
--> statement-breakpoint
ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_ratecard_id_fkey";
--> statement-breakpoint
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_level_id_fkey";
--> statement-breakpoint
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_role_id_fkey";
--> statement-breakpoint
ALTER TABLE "pricing_roles" DROP CONSTRAINT "pricing_roles_pricing_id_fkey";
--> statement-breakpoint
ALTER TABLE "pricing_roles" DROP CONSTRAINT "pricing_roles_role_id_fkey";
--> statement-breakpoint
ALTER TABLE "pricing_roles" DROP CONSTRAINT "pricing_roles_level_id_fkey";
--> statement-breakpoint
ALTER TABLE "pricings" DROP CONSTRAINT "pricings_ratecard_id_fkey";
--> statement-breakpoint
DROP INDEX "pricings_code_key";--> statement-breakpoint
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_pkey";--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "monthly_rate" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "level_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "ratecard_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "uuid" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "uuid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "uuid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "level_roles" ALTER COLUMN "level_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "level_roles" ALTER COLUMN "role_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "code" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "uuid" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "uuid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "uuid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pricing_roles" ALTER COLUMN "uuid" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "pricing_roles" ALTER COLUMN "uuid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pricing_roles" ALTER COLUMN "pricing_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pricing_roles" ALTER COLUMN "role_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pricing_roles" ALTER COLUMN "level_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "uuid" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "uuid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "code" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "customer_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "created_by" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "ratecard_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "effective_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "expire_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "uuid" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "uuid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "uuid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "role_code" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "uuid" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "uuid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "uuid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_ratecard_id_ratecards_id_fk" FOREIGN KEY ("ratecard_id") REFERENCES "public"."ratecards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_pricing_id_pricings_id_fk" FOREIGN KEY ("pricing_id") REFERENCES "public"."pricings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_ratecard_id_ratecards_id_fk" FOREIGN KEY ("ratecard_id") REFERENCES "public"."ratecards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_roles" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_code_unique" UNIQUE("code");