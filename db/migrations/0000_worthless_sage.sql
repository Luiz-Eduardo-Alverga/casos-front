CREATE TYPE "public"."status_type" AS ENUM('not_started');--> statement-breakpoint
CREATE TABLE "acquirer_compatible_devices" (
	"status_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"android_version" text,
	CONSTRAINT "acquirer_compatible_devices_pkey" PRIMARY KEY("status_id","device_id")
);
--> statement-breakpoint
CREATE TABLE "acquirer_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"acquirer_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"status" "status_type" DEFAULT 'not_started' NOT NULL,
	"current_version_id" uuid NOT NULL,
	"next_version_id" uuid,
	"delivery_date" date,
	"recommended_device_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"sort_order" integer DEFAULT 999,
	"is_active" boolean DEFAULT true NOT NULL,
	"obs" text
);
--> statement-breakpoint
CREATE TABLE "acquirers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo_url" text,
	"has_4g" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"email" text,
	"role" text DEFAULT 'admin',
	"avatar_url" text,
	CONSTRAINT "profiles_role_check" CHECK ("profiles"."role" = ANY (ARRAY['admin'::text, 'editor'::text]))
);
--> statement-breakpoint
CREATE TABLE "versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text
);
--> statement-breakpoint
ALTER TABLE "acquirer_compatible_devices" ADD CONSTRAINT "acquirer_compatible_devices_status_id_acquirer_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."acquirer_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acquirer_compatible_devices" ADD CONSTRAINT "acquirer_compatible_devices_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acquirer_status" ADD CONSTRAINT "acquirer_status_acquirer_id_acquirers_id_fk" FOREIGN KEY ("acquirer_id") REFERENCES "public"."acquirers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acquirer_status" ADD CONSTRAINT "acquirer_status_current_version_id_versions_id_fk" FOREIGN KEY ("current_version_id") REFERENCES "public"."versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acquirer_status" ADD CONSTRAINT "acquirer_status_next_version_id_versions_id_fk" FOREIGN KEY ("next_version_id") REFERENCES "public"."versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acquirer_status" ADD CONSTRAINT "acquirer_status_recommended_device_id_devices_id_fk" FOREIGN KEY ("recommended_device_id") REFERENCES "public"."devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;