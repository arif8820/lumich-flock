-- Fix movement_source enum: add 'purchase' value that was missing from DB
-- The 0006 migration tried CREATE TYPE which failed since type already existed
ALTER TYPE "public"."movement_source" ADD VALUE IF NOT EXISTS 'purchase';

-- Fix movement_source_type enum: add granular values added in 0006
ALTER TYPE "public"."movement_source_type" ADD VALUE IF NOT EXISTS 'daily_egg_records';
ALTER TYPE "public"."movement_source_type" ADD VALUE IF NOT EXISTS 'daily_feed_records';
ALTER TYPE "public"."movement_source_type" ADD VALUE IF NOT EXISTS 'daily_vaccine_records';
