-- Farm DDL Template
-- Execute after: SET search_path = "<schema_name>";
-- Creates all operational tables for a single farm schema.
-- Tables "farms" and "farm_users" are NOT included — they live in public schema only.

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE "coop_status" AS ENUM('active', 'inactive');
CREATE TYPE "customer_status" AS ENUM('active', 'inactive', 'blocked');
CREATE TYPE "customer_type" AS ENUM('retail', 'wholesale', 'distributor');
CREATE TYPE "movement_type" AS ENUM('in', 'out');
CREATE TYPE "movement_source" AS ENUM('production', 'sale', 'adjustment', 'regrade', 'import', 'purchase');
CREATE TYPE "movement_source_type" AS ENUM('daily_egg_records', 'daily_feed_records', 'daily_vaccine_records', 'sales_order_items', 'stock_adjustments', 'regrade_requests', 'sales_returns', 'import', 'bundle_contributions');
CREATE TYPE "regrade_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "sales_order_status" AS ENUM('draft', 'confirmed', 'fulfilled', 'cancelled');
CREATE TYPE "payment_method" AS ENUM('cash', 'credit');
CREATE TYPE "sales_item_type" AS ENUM('egg_grade_a', 'egg_grade_b', 'flock', 'other');
CREATE TYPE "sales_unit" AS ENUM('butir', 'ekor', 'unit');
CREATE TYPE "sales_return_status" AS ENUM('pending', 'approved', 'rejected');
CREATE TYPE "return_reason_type" AS ENUM('wrong_grade', 'damaged', 'quantity_error', 'other');
CREATE TYPE "invoice_type" AS ENUM('sales_invoice', 'cash_receipt', 'credit_note');
CREATE TYPE "invoice_status" AS ENUM('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled');
CREATE TYPE "payment_method_type" AS ENUM('cash', 'transfer', 'cheque', 'credit');
CREATE TYPE "credit_source_type" AS ENUM('overpayment', 'credit_note');
CREATE TYPE "correction_entity_type" AS ENUM('daily_records', 'inventory_movements', 'sales_orders');
CREATE TYPE "notification_type" AS ENUM('production_alert', 'overdue_invoice', 'stock_warning', 'phase_change', 'other');
CREATE TYPE "notification_target_role" AS ENUM('operator', 'supervisor', 'admin', 'all');

-- ============================================
-- CORE TABLES
-- ============================================

CREATE TABLE "roles" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "display_name" text NOT NULL,
    "is_system" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_by" uuid,
    CONSTRAINT "roles_name_unique" UNIQUE("name")
);

CREATE TABLE "role_permissions" (
    "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "permission_key" text NOT NULL,
    "granted_at" timestamp with time zone DEFAULT now() NOT NULL,
    "granted_by" uuid,
    PRIMARY KEY ("role_id", "permission_key")
);

CREATE TABLE "users" (
    "id" uuid PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "full_name" text NOT NULL,
    "phone" text,
    "role_id" uuid NOT NULL REFERENCES "roles"("id"),
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "coops" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "capacity" integer,
    "status" "coop_status" DEFAULT 'active' NOT NULL,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "coops_name_unique" UNIQUE("name")
);

CREATE TABLE "flock_phases" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "min_weeks" integer NOT NULL,
    "max_weeks" integer,
    "sort_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "customers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "type" "customer_type",
    "phone" text,
    "address" text,
    "email" text,
    "credit_limit" numeric(15, 2) DEFAULT '0' NOT NULL,
    "payment_terms" integer DEFAULT 0 NOT NULL,
    "status" "customer_status" DEFAULT 'active' NOT NULL,
    "notes" text,
    "is_imported" boolean DEFAULT false NOT NULL,
    "imported_by" uuid,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "flocks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "coop_id" uuid NOT NULL,
    "name" text NOT NULL,
    "arrival_date" date NOT NULL,
    "doc_date" date NOT NULL,
    "breed" text,
    "notes" text,
    "is_imported" boolean DEFAULT false NOT NULL,
    "imported_by" uuid,
    "retired_at" timestamp with time zone,
    "created_by" uuid,
    "updated_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

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

CREATE TABLE "user_coop_assignments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "coop_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "user_coop_assignments_user_id_coop_id_unique" UNIQUE("user_id","coop_id")
);

-- ============================================
-- PRODUCTION TABLES
-- ============================================

CREATE TABLE "daily_records" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "flock_id" uuid NOT NULL,
    "record_date" date NOT NULL,
    "deaths" integer DEFAULT 0 NOT NULL,
    "culled" integer DEFAULT 0 NOT NULL,
    "eggs_cracked" integer DEFAULT 0 NOT NULL,
    "eggs_abnormal" integer DEFAULT 0 NOT NULL,
    "is_late_input" boolean DEFAULT false NOT NULL,
    "notes" text,
    "is_imported" boolean DEFAULT false NOT NULL,
    "imported_by" uuid,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "daily_egg_records" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "daily_record_id" uuid NOT NULL,
    "stock_item_id" uuid NOT NULL,
    "qty_butir" integer DEFAULT 0 NOT NULL,
    "qty_kg" numeric(8, 2) DEFAULT '0' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "daily_egg_bundles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "daily_egg_record_id" uuid NOT NULL,
  "bundle_index" integer NOT NULL,
  "tray_count" integer NOT NULL,
  "top_tray_count" integer NOT NULL,
  "qty_butir" integer NOT NULL,
  "qty_kg" numeric(8, 2) NOT NULL,
  "bundle_code" varchar(12),
  "is_open" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone
);

CREATE TABLE "bundle_contributions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "bundle_id" uuid NOT NULL,
  "daily_egg_record_id" uuid NOT NULL,
  "qty_butir" integer NOT NULL,
  "qty_kg" numeric(8, 2) NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "daily_feed_records" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "daily_record_id" uuid NOT NULL,
    "stock_item_id" uuid NOT NULL,
    "qty_used" numeric(8, 2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "daily_vaccine_records" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "daily_record_id" uuid NOT NULL,
    "stock_item_id" uuid NOT NULL,
    "qty_used" numeric(8, 2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

-- ============================================
-- INVENTORY TABLES
-- ============================================

CREATE TABLE "stock_categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "unit" text NOT NULL,
    "is_system" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    CONSTRAINT "stock_categories_name_unique" UNIQUE("name")
);

CREATE TABLE "stock_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "category_id" uuid NOT NULL,
    "name" text NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "use_bundle_method" boolean DEFAULT false NOT NULL,
    "bundle_target_kg" numeric(8,2),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

CREATE TABLE "inventory_movements" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "flock_id" uuid,
    "stock_item_id" uuid NOT NULL,
    "movement_type" "movement_type" NOT NULL,
    "source" "movement_source" NOT NULL,
    "source_type" "movement_source_type",
    "source_id" uuid,
    "quantity" integer NOT NULL,
    "note" text,
    "movement_date" date NOT NULL,
    "is_imported" boolean DEFAULT false NOT NULL,
    "imported_by" uuid,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "stock_adjustments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "flock_id" uuid,
    "stock_item_id" uuid NOT NULL,
    "adjustment_date" date NOT NULL,
    "quantity" integer NOT NULL,
    "reason" text NOT NULL,
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "regrade_requests" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "from_item_id" uuid NOT NULL,
    "to_item_id" uuid NOT NULL,
    "quantity" integer NOT NULL,
    "status" "regrade_status" DEFAULT 'PENDING' NOT NULL,
    "request_date" date NOT NULL,
    "notes" text,
    "created_by" uuid,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================
-- SALES TABLES
-- ============================================

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

CREATE TABLE "sales_return_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "return_id" uuid NOT NULL,
    "item_type" "sales_item_type" NOT NULL,
    "item_ref_id" uuid,
    "quantity" integer NOT NULL,
    "unit" "sales_unit" NOT NULL
);

-- ============================================
-- FINANCE TABLES
-- ============================================

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

-- ============================================
-- KAS (CASH LEDGER) TABLES
-- ============================================

CREATE TYPE "cash_account_type" AS ENUM('cash', 'bank', 'ewallet');
CREATE TYPE "cash_transaction_type" AS ENUM('in', 'out', 'transfer_in', 'transfer_out');
CREATE TYPE "cash_category_type" AS ENUM('in', 'out', 'both');

CREATE TABLE "cash_categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "type" "cash_category_type" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "cash_accounts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "type" "cash_account_type" NOT NULL,
    "beginning_balance" numeric(15, 2) DEFAULT '0' NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone
);

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

-- ============================================
-- AUDIT / OPERATIONS TABLES
-- ============================================

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

CREATE TABLE "notification_reads" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "notification_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "read_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "alert_cooldowns" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "alert_type" text NOT NULL,
    "entity_type" text NOT NULL,
    "entity_id" uuid NOT NULL,
    "last_sent_at" timestamp with time zone NOT NULL
);

CREATE TABLE "app_settings" (
    "key" text PRIMARY KEY NOT NULL,
    "value" text NOT NULL,
    "updated_by" uuid,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================

ALTER TABLE "flocks" ADD CONSTRAINT "flocks_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "coops"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "flocks" ADD CONSTRAINT "flocks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "flocks" ADD CONSTRAINT "flocks_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "flocks" ADD CONSTRAINT "flocks_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "flock_deliveries" ADD CONSTRAINT "flock_deliveries_flock_id_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "flock_deliveries" ADD CONSTRAINT "flock_deliveries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "customers" ADD CONSTRAINT "customers_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "user_coop_assignments" ADD CONSTRAINT "user_coop_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_coop_assignments" ADD CONSTRAINT "user_coop_assignments_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "coops"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_flock_id_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "daily_egg_records" ADD CONSTRAINT "daily_egg_records_daily_record_id_daily_records_id_fk" FOREIGN KEY ("daily_record_id") REFERENCES "daily_records"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "daily_egg_records" ADD CONSTRAINT "daily_egg_records_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "daily_egg_bundles" ADD CONSTRAINT "daily_egg_bundles_daily_egg_record_id_fk" FOREIGN KEY ("daily_egg_record_id") REFERENCES "daily_egg_records"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "bundle_contributions" ADD CONSTRAINT "bundle_contributions_bundle_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "daily_egg_bundles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bundle_contributions" ADD CONSTRAINT "bundle_contributions_daily_egg_record_id_fk" FOREIGN KEY ("daily_egg_record_id") REFERENCES "daily_egg_records"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "bundle_contributions" ADD CONSTRAINT "bundle_contributions_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "daily_feed_records" ADD CONSTRAINT "daily_feed_records_daily_record_id_daily_records_id_fk" FOREIGN KEY ("daily_record_id") REFERENCES "daily_records"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "daily_feed_records" ADD CONSTRAINT "daily_feed_records_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "daily_vaccine_records" ADD CONSTRAINT "daily_vaccine_records_daily_record_id_daily_records_id_fk" FOREIGN KEY ("daily_record_id") REFERENCES "daily_records"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "daily_vaccine_records" ADD CONSTRAINT "daily_vaccine_records_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_category_id_stock_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "stock_categories"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_flock_id_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_flock_id_flocks_id_fk" FOREIGN KEY ("flock_id") REFERENCES "flocks"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "regrade_requests" ADD CONSTRAINT "regrade_requests_from_item_id_stock_items_id_fk" FOREIGN KEY ("from_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "regrade_requests" ADD CONSTRAINT "regrade_requests_to_item_id_stock_items_id_fk" FOREIGN KEY ("to_item_id") REFERENCES "stock_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "regrade_requests" ADD CONSTRAINT "regrade_requests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "regrade_requests" ADD CONSTRAINT "regrade_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_return_id_sales_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "sales_returns"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_return_id_sales_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "sales_returns"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_source_payment_id_payments_id_fk" FOREIGN KEY ("source_payment_id") REFERENCES "payments"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_source_invoice_id_invoices_id_fk" FOREIGN KEY ("source_invoice_id") REFERENCES "invoices"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "correction_records" ADD CONSTRAINT "correction_records_corrected_by_users_id_fk" FOREIGN KEY ("corrected_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "cash_accounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "cash_categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

-- ============================================
-- INDEXES
-- ============================================

CREATE UNIQUE INDEX "daily_records_flock_date_idx" ON "daily_records" USING btree ("flock_id","record_date");
CREATE UNIQUE INDEX "notification_reads_unique" ON "notification_reads" USING btree ("notification_id","user_id");
CREATE UNIQUE INDEX "alert_cooldowns_unique" ON "alert_cooldowns" USING btree ("alert_type","entity_id");
CREATE UNIQUE INDEX "stock_items_category_name_unique" ON "stock_items" USING btree ("category_id","name");
CREATE UNIQUE INDEX "daily_egg_records_record_item_unique" ON "daily_egg_records" USING btree ("daily_record_id","stock_item_id");
CREATE UNIQUE INDEX "daily_egg_bundles_record_index_unique" ON "daily_egg_bundles" USING btree ("daily_egg_record_id", "bundle_index");
CREATE UNIQUE INDEX "daily_feed_records_record_item_unique" ON "daily_feed_records" USING btree ("daily_record_id","stock_item_id");
CREATE UNIQUE INDEX "daily_vaccine_records_record_item_unique" ON "daily_vaccine_records" USING btree ("daily_record_id","stock_item_id");
CREATE UNIQUE INDEX "flocks_one_active_per_coop" ON "flocks" ("coop_id") WHERE "retired_at" IS NULL;
