-- Add org_id columns only to tables that exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'endpoints') THEN
        ALTER TABLE "endpoints" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
        ALTER TABLE "templates" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'widgets') THEN
        ALTER TABLE "widgets" ADD COLUMN "org_id" integer NOT NULL DEFAULT 1;
    END IF;
END $$;
--> statement-breakpoint

-- Add foreign key constraints only for tables that exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'endpoints') THEN
        ALTER TABLE "endpoints" ADD CONSTRAINT "endpoints_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
        ALTER TABLE "templates" ADD CONSTRAINT "templates_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'widgets') THEN
        ALTER TABLE "widgets" ADD CONSTRAINT "widgets_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint

-- Create indexes only for tables that exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'endpoints') THEN
        CREATE INDEX "endpoint_org_id_idx" ON "endpoints" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
        CREATE INDEX "template_org_id_idx" ON "templates" USING btree ("org_id");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'widgets') THEN
        CREATE INDEX "widget_org_id_idx" ON "widgets" USING btree ("org_id");
    END IF;
END $$;