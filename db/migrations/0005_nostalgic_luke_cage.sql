CREATE TABLE "user_cases_filters_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"filtros_resumo" jsonb DEFAULT '[{"field":"produto","colSpan":1},{"field":"versao","colSpan":1},{"field":"status_ids","colSpan":2}]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_cases_filters_preferences" ADD CONSTRAINT "user_cases_filters_preferences_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;