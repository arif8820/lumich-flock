-- Migration 5b: Finance schema (invoices, payments, customer_credits, corrections, notifications)
-- Schema only, no Sprint 5 UI for finance

-- ============================================
-- 1. INVOICE ENUMS
-- ============================================

CREATE TYPE "public"."invoice_type" AS ENUM ('sales_invoice', 'cash_receipt', 'credit_note');
CREATE TYPE "public"."invoice_status" AS ENUM ('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled');
CREATE TYPE "public"."payment_method_type" AS ENUM ('cash', 'transfer', 'cheque', 'credit');

-- ============================================
-- 2. INVOICES TABLE
-- ============================================

CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL UNIQUE,
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
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_return_id_sales_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."sales_returns"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- ============================================
-- 3. PAYMENTS TABLE
-- ============================================

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

ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- ============================================
-- 4. CUSTOMER_CREDITS TABLE
-- ============================================

CREATE TYPE "public"."credit_source_type" AS ENUM ('overpayment', 'credit_note');

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

ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_source_payment_id_payments_id_fk" FOREIGN KEY ("source_payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "customer_credits" ADD CONSTRAINT "customer_credits_source_invoice_id_invoices_id_fk" FOREIGN KEY ("source_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- ============================================
-- 5. CORRECTION_RECORDS TABLE
-- ============================================

CREATE TYPE "public"."correction_entity_type" AS ENUM ('daily_records', 'inventory_movements', 'sales_orders');

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

ALTER TABLE "correction_records" ADD CONSTRAINT "correction_records_corrected_by_users_id_fk" FOREIGN KEY ("corrected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- ============================================
-- 6. NOTIFICATIONS TABLE
-- ============================================

CREATE TYPE "public"."notification_type" AS ENUM ('production_alert', 'overdue_invoice', 'stock_warning', 'phase_change', 'other');
CREATE TYPE "public"."notification_target_role" AS ENUM ('operator', 'supervisor', 'admin', 'all');

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

-- ============================================
-- 7. NOTIFICATION_READS TABLE
-- ============================================

CREATE TABLE "notification_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

CREATE UNIQUE INDEX "notification_reads_unique" ON "notification_reads" USING btree ("notification_id","user_id");
--> statement-breakpoint

-- ============================================
-- 8. ALERT_COOLDOWNS TABLE
-- ============================================

CREATE TABLE "alert_cooldowns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_type" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"last_sent_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint

CREATE UNIQUE INDEX "alert_cooldowns_unique" ON "alert_cooldowns" USING btree ("alert_type","entity_id");
