-- Migration: flock_deliveries table + doc_date field + 1-active-flock-per-coop constraint
-- Step 1: Create flock_deliveries table
CREATE TABLE IF NOT EXISTS "flock_deliveries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "flock_id" uuid NOT NULL REFERENCES "flocks"("id"),
  "delivery_date" date NOT NULL,
  "quantity" integer NOT NULL,
  "age_at_arrival_days" integer,
  "notes" text,
  "created_by" uuid REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Step 2: Add doc_date as nullable first (so existing rows don't fail)
ALTER TABLE "flocks" ADD COLUMN "doc_date" date;
--> statement-breakpoint

-- Step 3: Backfill doc_date from arrival_date for all existing flocks
UPDATE "flocks" SET "doc_date" = "arrival_date" WHERE "doc_date" IS NULL;
--> statement-breakpoint

-- Step 4: Set doc_date NOT NULL now that all rows are backfilled
ALTER TABLE "flocks" ALTER COLUMN "doc_date" SET NOT NULL;
--> statement-breakpoint

-- Step 5: Backfill flock_deliveries from existing flocks (must happen before initial_count drop)
INSERT INTO "flock_deliveries" ("id", "flock_id", "delivery_date", "quantity", "created_at")
SELECT gen_random_uuid(), "id", "arrival_date", "initial_count", "created_at"
FROM "flocks";
--> statement-breakpoint

-- Step 6: Drop initial_count (after backfill to flock_deliveries)
ALTER TABLE "flocks" DROP COLUMN "initial_count";
--> statement-breakpoint

-- Step 7: Partial unique index — enforces 1 active flock per coop at DB level
CREATE UNIQUE INDEX "flocks_one_active_per_coop" ON "flocks" ("coop_id") WHERE "retired_at" IS NULL;
