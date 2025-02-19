CREATE TABLE "pricing_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" varchar NOT NULL,
	"pricing_id" serial NOT NULL,
	"role_id" serial NOT NULL,
	"level_id" serial NOT NULL,
	"quantity" integer NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"override_price" numeric(10, 2),
	"discount_rate" numeric(5, 2),
	"multiplier" numeric(5, 2) NOT NULL,
	"final_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricings" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" varchar NOT NULL,
	"code" varchar NOT NULL,
	"description" text NOT NULL,
	"customer_id" varchar NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"ratecard_id" serial NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"resource_count" integer NOT NULL,
	"overall_discounts" json,
	CONSTRAINT "pricings_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "rate_cards" RENAME TO "ratecards";--> statement-breakpoint
ALTER TABLE "level_rates" RENAME COLUMN "rate_card_id" TO "ratecard_id";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_uuid_unique";--> statement-breakpoint
ALTER TABLE "levels" DROP CONSTRAINT "levels_uuid_unique";--> statement-breakpoint
ALTER TABLE "ratecards" DROP CONSTRAINT "rate_cards_uuid_unique";--> statement-breakpoint
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_level_id_role_id_unique";--> statement-breakpoint
ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_level_id_rate_card_id_unique";--> statement-breakpoint
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_level_id_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_rate_card_id_rate_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_level_id_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "uuid" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "uuid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "uuid" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "uuid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "uuid" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "uuid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "level_roles" ALTER COLUMN "level_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "level_roles" ALTER COLUMN "role_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "level_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "monthly_rate" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "level_rates" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "role_code" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "levels" ADD COLUMN "code" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "ratecards" ADD COLUMN "expire_date" timestamp;--> statement-breakpoint
ALTER TABLE "level_rates" ADD COLUMN "uuid" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_pricing_id_pricings_id_fk" FOREIGN KEY ("pricing_id") REFERENCES "public"."pricings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_ratecard_id_ratecards_id_fk" FOREIGN KEY ("ratecard_id") REFERENCES "public"."ratecards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_ratecard_id_ratecards_id_fk" FOREIGN KEY ("ratecard_id") REFERENCES "public"."ratecards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_roles" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "level_roles" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "level_roles" DROP COLUMN "updated_at";