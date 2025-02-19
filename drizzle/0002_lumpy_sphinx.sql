ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_level_id_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_ratecard_id_ratecards_id_fk";
--> statement-breakpoint
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_level_id_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "level_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "ratecard_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "monthly_rate" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "created_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "level_roles" ALTER COLUMN "level_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "level_roles" ALTER COLUMN "role_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "code" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "created_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pricing_roles" ALTER COLUMN "pricing_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "pricing_roles" ALTER COLUMN "role_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "pricing_roles" ALTER COLUMN "level_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "code" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "customer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "created_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "ratecard_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "created_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "role_code" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "created_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "level_roles" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_ratecard_id_ratecards_id_fk" FOREIGN KEY ("ratecard_id") REFERENCES "public"."ratecards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_uuid_unique" UNIQUE("uuid");--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_pk" UNIQUE("level_id","role_id");--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_uuid_unique" UNIQUE("uuid");--> statement-breakpoint
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_uuid_unique" UNIQUE("uuid");--> statement-breakpoint
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_uuid_unique" UNIQUE("uuid");--> statement-breakpoint
ALTER TABLE "ratecards" ADD CONSTRAINT "ratecards_uuid_unique" UNIQUE("uuid");--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_uuid_unique" UNIQUE("uuid");