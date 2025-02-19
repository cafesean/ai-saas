CREATE TABLE "group" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone,
	"policy_ops" json,
	"policy_org" json
);
--> statement-breakpoint
CREATE TABLE "group_policy" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"name" text NOT NULL,
	"can_create" boolean DEFAULT false NOT NULL,
	"can_read" boolean DEFAULT false NOT NULL,
	"can_update" boolean DEFAULT false NOT NULL,
	"can_delete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "org" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"name" text,
	"country_id" integer,
	"type" smallint,
	"logo_url" text,
	"slug" text,
	"uuid" uuid DEFAULT uuid_generate_v4(),
	"updated_at" timestamp(6) with time zone,
	"status" smallint,
	"tier_id" integer DEFAULT 1 NOT NULL,
	"category_id" integer,
	"plan_id" integer,
	"verified_at" timestamp(3),
	"business_address" text,
	"business_licenses" text[],
	"linkedin_url" text,
	"website" text
);
--> statement-breakpoint
CREATE TABLE "org_user" (
	"org_id" integer NOT NULL,
	"user_uuid" uuid,
	"role" text NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "org_user_pkey" PRIMARY KEY("org_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "role_policy" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"name" text NOT NULL,
	"can_create" boolean DEFAULT false NOT NULL,
	"can_read" boolean DEFAULT false NOT NULL,
	"can_update" boolean DEFAULT false NOT NULL,
	"can_delete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "user" (
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"status" smallint,
	"wallets" text[],
	"wallet_type" integer,
	"attributes" jsonb,
	"tokens" jsonb,
	"xp" jsonb,
	"profile" jsonb,
	"role_id" integer[],
	"org_id" integer[],
	"updated_at" timestamp(6) with time zone,
	"referred_by" text,
	"is_registered" boolean,
	"name" text,
	"email" json,
	"password" text,
	"phone" json,
	"avatar" text,
	"username" text,
	"uuid" uuid DEFAULT uuid_generate_v4(),
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text
);
--> statement-breakpoint
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_pk";--> statement-breakpoint
ALTER TABLE "pricings" DROP CONSTRAINT "pricings_uuid_unique";--> statement-breakpoint
ALTER TABLE "pricings" DROP CONSTRAINT "pricings_code_unique";--> statement-breakpoint
ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_level_id_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_ratecard_id_ratecards_id_fk";
--> statement-breakpoint
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_level_id_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "pricing_roles" DROP CONSTRAINT "pricing_roles_pricing_id_pricings_id_fk";
--> statement-breakpoint
ALTER TABLE "pricing_roles" DROP CONSTRAINT "pricing_roles_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "pricing_roles" DROP CONSTRAINT "pricing_roles_level_id_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "pricings" DROP CONSTRAINT "pricings_ratecard_id_ratecards_id_fk";
--> statement-breakpoint
ALTER TABLE "level_roles" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "level_roles" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "level_roles" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pricings" ALTER COLUMN "uuid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "effective_date" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "ratecards" ALTER COLUMN "expire_date" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_pkey" PRIMARY KEY("level_id","role_id");--> statement-breakpoint
ALTER TABLE "group_policy" ADD CONSTRAINT "group_policy_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_user" ADD CONSTRAINT "org_user_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."org"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_user" ADD CONSTRAINT "org_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_policy" ADD CONSTRAINT "role_policy_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_ratecard_id_fkey" FOREIGN KEY ("ratecard_id") REFERENCES "public"."ratecards"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_pricing_id_fkey" FOREIGN KEY ("pricing_id") REFERENCES "public"."pricings"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pricing_roles" ADD CONSTRAINT "pricing_roles_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_ratecard_id_fkey" FOREIGN KEY ("ratecard_id") REFERENCES "public"."ratecards"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "pricings_code_key" ON "pricings" USING btree ("code" text_ops);