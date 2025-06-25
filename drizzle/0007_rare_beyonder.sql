ALTER TABLE "endpoints" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "widgets" ADD COLUMN "org_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "endpoints" ADD CONSTRAINT "endpoints_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "endpoint_org_id_idx" ON "endpoints" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "template_org_id_idx" ON "templates" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "widget_org_id_idx" ON "widgets" USING btree ("org_id");