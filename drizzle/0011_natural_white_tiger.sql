CREATE TABLE "providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"api_key" varchar(500) NOT NULL,
	"base_url" varchar(500),
	"timeout" integer DEFAULT 30000,
	"max_retries" integer DEFAULT 3,
	"config" json,
	"rate_limiting" json,
	"last_health_check" timestamp with time zone,
	"health_status" varchar(50) DEFAULT 'unknown',
	"health_error" text,
	"org_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "providers_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE INDEX "providers_provider_id_idx" ON "providers" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "providers_org_id_idx" ON "providers" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "providers_type_idx" ON "providers" USING btree ("type");--> statement-breakpoint
CREATE INDEX "providers_enabled_idx" ON "providers" USING btree ("enabled");--> statement-breakpoint
CREATE UNIQUE INDEX "providers_provider_id_org_unique" ON "providers" USING btree ("provider_id","org_id");