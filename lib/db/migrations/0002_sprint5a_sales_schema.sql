-- Migration 5a: Inventory refactor + Sales schema + Customers fix
-- Breaking changes to inventory_movements + new sales tables

-- ============================================
-- 1. INVENTORY_MOVEMENTS REFACTOR
-- ============================================

-- Create new enums
CREATE TYPE "public"."movement_type" AS ENUM ('in', 'out');
CREATE TYPE "public"."movement_source" AS ENUM ('production', 'sale', 'adjustment', 'regrade', 'import');
CREATE TYPE "public"."movement_source_type" AS ENUM ('daily_records', 'sales_order_items', 'stock_adjustments', 'regrade_requests', 'sales_returns', 'import');

-- Add new columns
ALTER TABLE "inventory_movements" ADD COLUMN "source" "movement_source";
ALTER TABLE "inventory_movements" ADD COLUMN "source_type" "movement_source_type";
ALTER TABLE "inventory_movements" ADD COLUMN "source_id" uuid;

-- Migrate data from old columns to new columns
UPDATE "inventory_movements" SET
  "source_type" = CASE "reference_type"
    WHEN 'daily_record' THEN 'daily_records'::"movement_source_type"
    WHEN 'stock_adjustment' THEN 'stock_adjustments'::"movement_source_type"
    WHEN 'regrade' THEN 'regrade_requests'::"movement_source_type"
    ELSE NULL
  END,
  "source_id" = "reference_id",
  "source" = CASE "reference_type"
    WHEN 'daily_record' THEN 'production'::"movement_source"
    WHEN 'stock_adjustment' THEN 'adjustment'::"movement_source"
    WHEN 'regrade' THEN 'regrade'::"movement_source"
    ELSE 'import'::"movement_source"
  END;

-- Set NOT NULL on source column after data migration
ALTER TABLE "inventory_movements" ALTER COLUMN "source" SET NOT NULL;

-- Convert movement_type from text to enum
-- First update existing values to lowercase
UPDATE "inventory_movements" SET "movement_type" = lower("movement_type");

-- Drop old text column, add new enum column
ALTER TABLE "inventory_movements" RENAME COLUMN "movement_type" TO "movement_type_old";
ALTER TABLE "inventory_movements" ADD COLUMN "movement_type" "movement_type" NOT NULL DEFAULT 'in';
UPDATE "inventory_movements" SET "movement_type" = "movement_type_old"::"movement_type";
ALTER TABLE "inventory_movements" DROP COLUMN "movement_type_old";

-- Make flock_id nullable
ALTER TABLE "inventory_movements" ALTER COLUMN "flock_id" DROP NOT NULL;

-- Drop old columns
ALTER TABLE "inventory_movements" DROP COLUMN IF EXISTS "reference_type";
ALTER TABLE "inventory_movements" DROP COLUMN IF EXISTS "reference_id";

-- ============================================
-- 2. SALES ORDER ENUMS
-- ============================================

CREATE TYPE "public"."sales_order_status" AS ENUM ('draft', 'confirmed', 'fulfilled', 'cancelled');
CREATE TYPE "public"."payment_method" AS ENUM ('cash', 'credit');
CREATE TYPE "public"."sales_item_type" AS ENUM ('egg_grade_a', 'egg_grade_b', 'flock', 'other');
CREATE TYPE "public"."sales_unit" AS ENUM ('butir', 'ekor', 'unit');

-- ============================================
-- 3. SALES_ORDERS TABLE
-- ============================================

CREATE TABLE "sales_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL UNIQUE,
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
	"updated_at" timestamp with time zone
);
--> statement-breakpoint

ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- ============================================
-- 4. SALES_ORDER_ITEMS TABLE
-- ============================================

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

ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- ============================================
-- 5. SALES_RETURN ENUMS
-- ============================================

CREATE TYPE "public"."sales_return_status" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "public"."return_reason_type" AS ENUM ('wrong_grade', 'damaged', 'quantity_error', 'other');

-- ============================================
-- 6. SALES_RETURNS TABLE
-- ============================================

CREATE TABLE "sales_returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_number" text NOT NULL UNIQUE,
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
	"updated_at" timestamp with time zone
);
--> statement-breakpoint

ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- ============================================
-- 7. SALES_RETURN_ITEMS TABLE
-- ============================================

CREATE TABLE "sales_return_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_id" uuid NOT NULL,
	"item_type" "sales_item_type" NOT NULL,
	"item_ref_id" uuid,
	"quantity" integer NOT NULL,
	"unit" "sales_unit" NOT NULL
);
--> statement-breakpoint

ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_return_id_sales_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."sales_returns"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- ============================================
-- 8. CUSTOMERS FIX: Add 'blocked' to status enum
-- ============================================

-- PostgreSQL doesn't support ALTER TYPE ADD VALUE inside transactions in all versions
-- Using the safe approach: alter type add value
ALTER TYPE "public"."customer_status" ADD VALUE IF NOT EXISTS 'blocked' AFTER 'inactive';
