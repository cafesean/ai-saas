CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "levels_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "rate_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(500),
	"effective_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rate_cards_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "level_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"level_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "level_roles_level_id_role_id_unique" UNIQUE("level_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "level_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"level_id" integer NOT NULL,
	"rate_card_id" integer NOT NULL,
	"monthly_rate" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "level_rates_level_id_rate_card_id_unique" UNIQUE("level_id","rate_card_id")
);
--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_roles" ADD CONSTRAINT "level_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_rates" ADD CONSTRAINT "level_rates_rate_card_id_rate_cards_id_fk" FOREIGN KEY ("rate_card_id") REFERENCES "public"."rate_cards"("id") ON DELETE cascade ON UPDATE no action;