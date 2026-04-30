-- Migration 0005: Phase 4 Operations
-- Sprint 7: is_imported columns for import feature
-- Sprint 8: pg_cron alert job setup + app_settings seeds for alert thresholds

-- ============================================
-- 1. ADD is_imported / imported_by TO flocks
-- ============================================

ALTER TABLE "flocks" ADD COLUMN IF NOT EXISTS "is_imported" boolean NOT NULL DEFAULT false;
--> statement-breakpoint

ALTER TABLE "flocks" ADD COLUMN IF NOT EXISTS "imported_by" uuid REFERENCES "public"."users"("id");
--> statement-breakpoint

-- ============================================
-- 2. ADD is_imported / imported_by TO daily_records
-- ============================================

ALTER TABLE "daily_records" ADD COLUMN IF NOT EXISTS "is_imported" boolean NOT NULL DEFAULT false;
--> statement-breakpoint

ALTER TABLE "daily_records" ADD COLUMN IF NOT EXISTS "imported_by" uuid REFERENCES "public"."users"("id");
--> statement-breakpoint

-- ============================================
-- 3. ADD is_imported / imported_by TO customers
-- ============================================

ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "is_imported" boolean NOT NULL DEFAULT false;
--> statement-breakpoint

ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "imported_by" uuid REFERENCES "public"."users"("id");
--> statement-breakpoint

-- ============================================
-- 4. ADD is_imported / imported_by TO inventory_movements
-- ============================================

ALTER TABLE "inventory_movements" ADD COLUMN IF NOT EXISTS "is_imported" boolean NOT NULL DEFAULT false;
--> statement-breakpoint

ALTER TABLE "inventory_movements" ADD COLUMN IF NOT EXISTS "imported_by" uuid REFERENCES "public"."users"("id");
--> statement-breakpoint

-- ============================================
-- 5. SEED app_settings: alert thresholds
-- ============================================

INSERT INTO "app_settings" ("key","value","updated_at") VALUES
  ('alert_fcr_threshold',     '2.5',  NOW()),
  ('alert_depletion_pct',     '0.5',  NOW()),
  ('alert_hdp_drop_pct',      '5',    NOW()),
  ('alert_overdue_delay_days','1',    NOW())
ON CONFLICT (key) DO NOTHING;

INSERT INTO "app_settings" ("key", "value") VALUES ('alert_stock_max_threshold', '10000') ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint

-- ============================================
-- 6. ENABLE pg_cron extension (idempotent)
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
--> statement-breakpoint

-- ============================================
-- 7. SCHEDULE daily alert job at 06:00 UTC+7 = 23:00 UTC
-- ============================================

-- Remove old schedule if exists (idempotent)
SELECT cron.unschedule('lumichflock_daily_alerts') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'lumichflock_daily_alerts'
);
--> statement-breakpoint

SELECT cron.schedule(
  'lumichflock_daily_alerts',
  '0 23 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.alert_webhook_url', true),
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || current_setting('app.alert_webhook_secret', true)),
    body := '{}'::jsonb
  )$$
);
