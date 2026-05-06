-- Migration: add public.farms and public.farm_users tables for multi-farm schema isolation

CREATE TABLE IF NOT EXISTS "public"."farms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "schema_name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone,
  CONSTRAINT "farms_schema_name_unique" UNIQUE ("schema_name")
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "public"."farm_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "farm_schema" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone,
  CONSTRAINT "farm_users_email_unique" UNIQUE ("email"),
  CONSTRAINT "farm_users_farm_schema_farms_schema_name_fk" FOREIGN KEY ("farm_schema") REFERENCES "public"."farms"("schema_name")
);
