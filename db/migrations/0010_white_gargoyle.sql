CREATE TABLE "doc_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doc_id" uuid NOT NULL,
	"bucket" text DEFAULT 'casos-anexos' NOT NULL,
	"path" text NOT NULL,
	"filename_original" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"kind" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "doc_attachments_path_unique" UNIQUE("path")
);
--> statement-breakpoint
ALTER TABLE "doc_attachments" ADD CONSTRAINT "doc_attachments_doc_id_docs_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_attachments" ADD CONSTRAINT "doc_attachments_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "doc_attachments_doc_id_idx" ON "doc_attachments" USING btree ("doc_id");