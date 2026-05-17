CREATE TYPE "public"."cash_category_type" AS ENUM('in', 'out', 'both');--> statement-breakpoint
CREATE TYPE "public"."cash_account_type" AS ENUM('cash', 'bank', 'ewallet');--> statement-breakpoint
CREATE TYPE "public"."cash_transaction_type" AS ENUM('in', 'out', 'transfer_in', 'transfer_out');--> statement-breakpoint
ALTER TYPE "public"."movement_source_type" ADD VALUE 'bundle_contributions';--> statement-breakpoint
CREATE TABLE "flock_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flock_id" uuid NOT NULL,
	"delivery_date" date NOT NULL,
	"quantity" integer NOT NULL,
	"age_at_arrival_days" integer,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
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
CREATE TABLE "farms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"schema_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "farms_schema_name_unique" UNIQUE("schema_name")
);
--> statement-breakpoint
CREATE TABLE "farm_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"farm_schema" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "farm_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cash_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "cash_category_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "cash_account_type" NOT NULL,
	"beginning_balance" numeric(15, 2) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cash_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"type" "cash_transaction_type" NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"transaction_date" date NOT NULL,
	"category_id" uuid,
	"reference_number" text,
	"description" text,
	"transfer_ref_id" uuid,
	"source_type" text,
	"source_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "flocks" ADD COLUMN "doc_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_items" ADD COLUMN "bundle_target_kg" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "daily_egg_bundles" ADD COLUMN "is_open" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "flock_deliveries" ADD CONSTRAINT "flock_deliveries_flock_id_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "public"."flocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flock_deliveries" ADD CONSTRAINT "flock_deliveries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_contributions" ADD CONSTRAINT "bundle_contributions_bundle_id_daily_egg_bundles_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."daily_egg_bundles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_contributions" ADD CONSTRAINT "bundle_contributions_daily_egg_record_id_daily_egg_records_id_fk" FOREIGN KEY ("daily_egg_record_id") REFERENCES "public"."daily_egg_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_contributions" ADD CONSTRAINT "bundle_contributions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farm_users" ADD CONSTRAINT "farm_users_farm_schema_farms_schema_name_fk" FOREIGN KEY ("farm_schema") REFERENCES "public"."farms"("schema_name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_account_id_cash_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_category_id_cash_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."cash_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flocks" DROP COLUMN "initial_count";