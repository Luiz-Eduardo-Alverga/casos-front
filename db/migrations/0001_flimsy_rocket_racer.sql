ALTER TABLE "acquirer_status" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "acquirer_status" ALTER COLUMN "status" SET DEFAULT 'Em homologação'::text;--> statement-breakpoint
DROP TYPE "public"."status_type";--> statement-breakpoint
CREATE TYPE "public"."status_type" AS ENUM('Em desenvolvimento', 'Em teste', 'Em homologação', 'Em certificação', 'Concluído');--> statement-breakpoint
ALTER TABLE "acquirer_status" ALTER COLUMN "status" SET DEFAULT 'Em homologação'::"public"."status_type";--> statement-breakpoint
ALTER TABLE "acquirer_status" ALTER COLUMN "status" SET DATA TYPE "public"."status_type" USING "status"::"public"."status_type";--> statement-breakpoint
ALTER TABLE "versions" ALTER COLUMN "name" SET NOT NULL;