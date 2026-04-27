-- Migration 6b: PDF invoice, email support, and app_settings table

-- ============================================
-- 1. ADD pdf_url AND pdf_generated_at TO invoices
-- ============================================

ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "pdf_url" text;
--> statement-breakpoint

ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "pdf_generated_at" timestamp with time zone;
--> statement-breakpoint

-- ============================================
-- 2. ADD email TO customers
-- ============================================

ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email" text;
--> statement-breakpoint

-- ============================================
-- 3. CREATE app_settings TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- ============================================
-- 4. SEED: default WhatsApp invoice template
-- ============================================

INSERT INTO "app_settings" ("key","value","updated_at") VALUES (
  'wa_invoice_template',
  'Yth. {customerName},\n\nInvoice {invoiceNumber} senilai Rp {totalAmount} jatuh tempo pada {dueDate}.\nUnduh invoice: {pdfUrl}\n\nTerima kasih.',
  NOW()
) ON CONFLICT (key) DO NOTHING;
