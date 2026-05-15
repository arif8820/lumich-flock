ALTER TABLE "stock_items" ADD COLUMN "use_bundle_method" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE TABLE "daily_egg_bundles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_egg_record_id" uuid NOT NULL,
	"bundle_index" integer NOT NULL,
	"tray_count" integer NOT NULL,
	"top_tray_count" integer NOT NULL,
	"qty_butir" integer NOT NULL,
	"qty_kg" numeric(8, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "daily_egg_bundles" ADD CONSTRAINT "daily_egg_bundles_daily_egg_record_id_daily_egg_records_id_fk" FOREIGN KEY ("daily_egg_record_id") REFERENCES "public"."daily_egg_records"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "daily_egg_bundles_record_index_unique" ON "daily_egg_bundles" USING btree ("daily_egg_record_id","bundle_index");
