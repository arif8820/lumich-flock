-- Migration: add roles and role_permissions tables, migrate users.role to users.role_id FK
-- Part of Dynamic RBAC feature (Task 1)

CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "display_name" text NOT NULL,
    "is_system" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_by" uuid,
    CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "role_id" uuid NOT NULL,
    "permission_key" text NOT NULL,
    "granted_at" timestamp with time zone DEFAULT now() NOT NULL,
    "granted_by" uuid,
    CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade,
    PRIMARY KEY ("role_id", "permission_key")
);
--> statement-breakpoint
ALTER TABLE "public"."users" ADD COLUMN "role_id" uuid;
--> statement-breakpoint
ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "role";
--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "role_id" SET NOT NULL;
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."role";
