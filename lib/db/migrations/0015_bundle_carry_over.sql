ALTER TYPE "public"."movement_source_type" ADD VALUE 'bundle_contributions';
--> statement-breakpoint
CREATE TABLE "bundle_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bundle_id" uuid NOT NULL,
	"daily_egg_record_id" uuid NOT NULL,
	"qty_butir" integer NOT NULL,
	"qty_kg" numeric(8, 2) NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bundle_contributions" ADD CONSTRAINT "bundle_contributions_bundle_id_daily_egg_bundles_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."daily_egg_bundles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "bundle_contributions" ADD CONSTRAINT "bundle_contributions_daily_egg_record_id_daily_egg_records_id_fk" FOREIGN KEY ("daily_egg_record_id") REFERENCES "public"."daily_egg_records"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "bundle_contributions" ADD CONSTRAINT "bundle_contributions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "stock_items" ADD COLUMN "bundle_target_kg" numeric(8, 2);
--> statement-breakpoint
ALTER TABLE "daily_egg_bundles" ADD COLUMN "is_open" boolean DEFAULT false NOT NULL;
