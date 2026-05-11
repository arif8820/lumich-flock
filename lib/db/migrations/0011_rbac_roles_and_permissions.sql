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
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_key" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"granted_by" uuid,
	CONSTRAINT "role_permissions_role_id_permission_key_pk" PRIMARY KEY("role_id","permission_key")
);
--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Seed default roles before migrating users.role -> users.role_id
INSERT INTO "roles" ("name", "display_name", "is_system") VALUES
  ('admin', 'Admin', true),
  ('supervisor', 'Supervisor', false),
  ('operator', 'Operator', false);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role_id" uuid;
--> statement-breakpoint
-- Migrate existing role enum values to role_id FK
UPDATE "users" SET "role_id" = (SELECT "id" FROM "roles" WHERE "roles"."name" = "users"."role"::text);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";
--> statement-breakpoint
DROP TYPE "public"."role";
