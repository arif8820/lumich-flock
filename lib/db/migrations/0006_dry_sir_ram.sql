CREATE TYPE "public"."movement_source" AS ENUM('production', 'sale', 'adjustment', 'regrade', 'import', 'purchase');--> statement-breakpoint
CREATE TYPE "public"."movement_source_type" AS ENUM('daily_egg_records', 'daily_feed_records', 'daily_vaccine_records', 'sales_order_items', 'stock_adjustments', 'regrade_requests', 'sales_returns', 'import');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('in', 'out');--> statement-breakpoint
CREATE TYPE "public"."regrade_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'credit');--> statement-breakpoint
CREATE TYPE "public"."sales_order_status" AS ENUM('draft', 'confirmed', 'fulfilled', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."sales_item_type" AS ENUM('egg_grade_a', 'egg_grade_b', 'flock', 'other');--> statement-breakpoint
CREATE TYPE "public"."sales_unit" AS ENUM('butir', 'ekor', 'unit');--> statement-breakpoint
CREATE TYPE "public"."return_reason_type" AS ENUM('wrong_grade', 'damaged', 'quantity_error', 'other');--> statement-breakpoint
CREATE TYPE "public"."sales_return_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."invoice_type" AS ENUM('sales_invoice', 'cash_receipt', 'credit_note');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('cash', 'transfer', 'cheque', 'credit');--> statement-breakpoint
CREATE TYPE "public"."credit_source_type" AS ENUM('overpayment', 'credit_note');--> statement-breakpoint
CREATE TYPE "public"."correction_entity_type" AS ENUM('daily_records', 'inventory_movements', 'sales_orders');--> statement-breakpoint
CREATE TYPE "public"."notification_target_role" AS ENUM('operator', 'supervisor', 'admin', 'all');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('production_alert', 'overdue_invoice', 'stock_warning', 'phase_change', 'other');--> statement-breakpoint
ALTER TYPE "public"."customer_status" ADD VALUE 'blocked';--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"order_date" date NOT NULL,
	"customer_id" uuid NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"status" "sales_order_status" DEFAULT 'draft' NOT NULL,
	"tax_pct" numeric(5, 2) DEFAULT '0' NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL,
	"tax_amount" numeric(15, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"notes" text,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "sales_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "sales_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"item_type" "sales_item_type" NOT NULL,
	"item_ref_id" uuid,
	"description" text,
	"quantity" integer NOT NULL,
	"unit" "sales_unit" NOT NULL,
	"price_per_unit" numeric(15, 2) NOT NULL,
	"discount_pct" numeric(5, 2) DEFAULT '0' NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_number" text NOT NULL,
	"order_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"return_date" date NOT NULL,
	"reason_type" "return_reason_type" NOT NULL,
	"notes" text,
	"status" "sales_return_status" DEFAULT 'pending' NOT NULL,
	"submitted_by" uuid,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "sales_returns_return_number_unique" UNIQUE("return_number")
);
--> statement-breakpoint
CREATE TABLE "sales_return_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_id" uuid NOT NULL,
	"item_type" "sales_item_type" NOT NULL,
	"item_ref_id" uuid,
	"quantity" integer NOT NULL,
	"unit" "sales_unit" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"type" "invoice_type" NOT NULL,
	"order_id" uuid,
	"reference_invoice_id" uuid,
	"return_id" uuid,
	"customer_id" uuid NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"status" "invoice_status" NOT NULL,
	"pdf_url" text,
	"pdf_generated_at" timestamp with time zone,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"payment_date" date NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"method" "payment_method_type" NOT NULL,
	"reference_number" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customer_credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"source_type" "credit_source_type" NOT NULL,
	"source_payment_id" uuid,
	"source_invoice_id" uuid,
	"used_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "correction_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "correction_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"field_name" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"reason" text NOT NULL,
	"corrected_by" uuid NOT NULL,
	"corrected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"target_role" "notification_target_role" NOT NULL,
	"related_entity_type" text,
	"related_entity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_cooldowns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_type" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"last_sent_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "stock_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "stock_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "daily_egg_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_record_id" uuid NOT NULL,
	"stock_item_id" uuid NOT NULL,
	"qty_butir" integer DEFAULT 0 NOT NULL,
	"qty_kg" numeric(8, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "daily_feed_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_record_id" uuid NOT NULL,
	"stock_item_id" uuid NOT NULL,
	"qty_used" numeric(8, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "daily_vaccine_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_record_id" uuid NOT NULL,
	"stock_item_id" uuid NOT NULL,
	"qty_used" numeric(8, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "inventory_snapshots" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "inventory_snapshots" CASCADE;--> statement-breakpoint
ALTER TABLE "daily_records" DROP CONSTRAINT "daily_records_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "regrade_requests" DROP CONSTRAINT "regrade_requests_flock_id_flocks_id_fk";
--> statement-breakpoint
DROP INDEX "daily_records_flock_date_unique";--> statement-breakpoint
ALTER TABLE "inventory_movements" ALTER COLUMN "flock_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_movements" ALTER COLUMN "movement_type" SET DATA TYPE "public"."movement_type" USING "movement_type"::"public"."movement_type";--> statement-breakpoint
ALTER TABLE "stock_adjustments" ALTER COLUMN "flock_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "regrade_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"public"."regrade_status";--> statement-breakpoint
ALTER TABLE "regrade_requests" ALTER COLUMN "status" SET DATA TYPE "public"."regrade_status" USING "status"::"public"."regrade_status";--> statement-breakpoint
ALTER TABLE "flocks" ADD COLUMN "is_imported" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "flocks" ADD COLUMN "imported_by" uuid;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "is_imported" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "imported_by" uuid;--> statement-breakpoint
ALTER TABLE "daily_records" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "daily_records" ADD COLUMN "is_imported" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_records" ADD COLUMN "imported_by" uuid;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "stock_item_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "source" "movement_source" NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "source_type" "movement_source_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "source_id" uuid;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "is_imported" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "imported_by" uuid;--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD COLUMN "stock_item_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "regrade_requests" ADD COLUMN "from_item_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "regrade_requests" ADD COLUMN "to_item_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_return_id_sales_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."sales_returns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_return_id_sales_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."sales_returns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_source_payment_id_payments_id_fk" FOREIGN KEY ("source_payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_source_invoice_id_invoices_id_fk" FOREIGN KEY ("source_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "correction_records" ADD CONSTRAINT "correction_records_corrected_by_users_id_fk" FOREIGN KEY ("corrected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_category_id_stock_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."stock_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_egg_records" ADD CONSTRAINT "daily_egg_records_daily_record_id_daily_records_id_fk" FOREIGN KEY ("daily_record_id") REFERENCES "public"."daily_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_egg_records" ADD CONSTRAINT "daily_egg_records_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_feed_records" ADD CONSTRAINT "daily_feed_records_daily_record_id_daily_records_id_fk" FOREIGN KEY ("daily_record_id") REFERENCES "public"."daily_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_feed_records" ADD CONSTRAINT "daily_feed_records_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_vaccine_records" ADD CONSTRAINT "daily_vaccine_records_daily_record_id_daily_records_id_fk" FOREIGN KEY ("daily_record_id") REFERENCES "public"."daily_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_vaccine_records" ADD CONSTRAINT "daily_vaccine_records_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "notification_reads_unique" ON "notification_reads" USING btree ("notification_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "alert_cooldowns_unique" ON "alert_cooldowns" USING btree ("alert_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_items_category_name_unique" ON "stock_items" USING btree ("category_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_egg_records_record_item_unique" ON "daily_egg_records" USING btree ("daily_record_id","stock_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_feed_records_record_item_unique" ON "daily_feed_records" USING btree ("daily_record_id","stock_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_vaccine_records_record_item_unique" ON "daily_vaccine_records" USING btree ("daily_record_id","stock_item_id");--> statement-breakpoint
ALTER TABLE "flocks" ADD CONSTRAINT "flocks_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regrade_requests" ADD CONSTRAINT "regrade_requests_from_item_id_stock_items_id_fk" FOREIGN KEY ("from_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regrade_requests" ADD CONSTRAINT "regrade_requests_to_item_id_stock_items_id_fk" FOREIGN KEY ("to_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_records_flock_date_idx" ON "daily_records" USING btree ("flock_id","record_date");--> statement-breakpoint
ALTER TABLE "daily_records" DROP COLUMN "eggs_grade_a";--> statement-breakpoint
ALTER TABLE "daily_records" DROP COLUMN "eggs_grade_b";--> statement-breakpoint
ALTER TABLE "daily_records" DROP COLUMN "avg_weight_kg";--> statement-breakpoint
ALTER TABLE "daily_records" DROP COLUMN "feed_kg";--> statement-breakpoint
ALTER TABLE "daily_records" DROP COLUMN "updated_by";--> statement-breakpoint
ALTER TABLE "daily_records" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "inventory_movements" DROP COLUMN "grade";--> statement-breakpoint
ALTER TABLE "inventory_movements" DROP COLUMN "reference_type";--> statement-breakpoint
ALTER TABLE "inventory_movements" DROP COLUMN "reference_id";--> statement-breakpoint
ALTER TABLE "stock_adjustments" DROP COLUMN "grade";--> statement-breakpoint
ALTER TABLE "regrade_requests" DROP COLUMN "flock_id";--> statement-breakpoint
ALTER TABLE "regrade_requests" DROP COLUMN "grade_from";--> statement-breakpoint
ALTER TABLE "regrade_requests" DROP COLUMN "grade_to";--> statement-breakpoint
ALTER TABLE "regrade_requests" DROP COLUMN "updated_at";