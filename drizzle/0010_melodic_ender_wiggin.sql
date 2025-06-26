ALTER TABLE "models" ADD COLUMN "provider" varchar(50);--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "architecture" varchar(100);--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "capabilities" json;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "model_info" json;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "training_info" json;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "performance_metrics" json;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "provider_config" json;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "enhanced_input_schema" json;--> statement-breakpoint
ALTER TABLE "models" ADD COLUMN "enhanced_output_schema" json;--> statement-breakpoint
CREATE INDEX "model_provider_idx" ON "models" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "model_architecture_idx" ON "models" USING btree ("architecture");