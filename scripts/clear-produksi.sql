-- Clear produksi + stok data (Scope B)
-- Master data (flocks, stock_items, stock_categories, coops) NOT touched
--
-- Usage: replace 'farm_uat_test' with target schema, then run in Supabase SQL Editor

DO $$
DECLARE
  s text := 'farm_uat_test'; -- <<< GANTI SCHEMA DI SINI
BEGIN

  -- Children first, parents last (respect FK order)
  EXECUTE format('DELETE FROM %I.bundle_contributions',    s);
  EXECUTE format('DELETE FROM %I.daily_egg_bundles',       s);
  EXECUTE format('DELETE FROM %I.daily_egg_records',       s);
  EXECUTE format('DELETE FROM %I.daily_feed_records',      s);
  EXECUTE format('DELETE FROM %I.daily_vaccine_records',   s);
  EXECUTE format('DELETE FROM %I.correction_records',      s);
  EXECUTE format('DELETE FROM %I.stock_adjustments',       s);
  EXECUTE format('DELETE FROM %I.regrade_requests',        s);
  EXECUTE format('DELETE FROM %I.inventory_movements',     s);
  EXECUTE format('DELETE FROM %I.daily_records',           s);

  -- inventory_snapshots: delete only if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = s AND table_name = 'inventory_snapshots'
  ) THEN
    EXECUTE format('DELETE FROM %I.inventory_snapshots', s);
  END IF;

  RAISE NOTICE 'Done clearing produksi data for schema: %', s;
END $$;
