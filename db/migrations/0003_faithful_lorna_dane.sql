CREATE TABLE "permission_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "permission_modules_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "module_id" uuid;
--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "label" text;
--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
INSERT INTO "permission_modules" ("slug", "name", "sort_order")
VALUES ('legacy', 'Legado', 0);
--> statement-breakpoint
UPDATE "permissions"
SET
	"module_id" = (SELECT "id" FROM "permission_modules" WHERE "slug" = 'legacy' LIMIT 1),
	"label" = COALESCE(NULLIF(trim("code"), ''), "id"::text)
WHERE "module_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "module_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "label" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_module_id_permission_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."permission_modules"("id") ON DELETE restrict ON UPDATE no action;
