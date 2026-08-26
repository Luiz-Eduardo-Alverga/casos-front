CREATE TYPE "public"."doc_action" AS ENUM('created', 'updated', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."doc_link_type" AS ENUM('acquirer', 'product', 'client', 'case');--> statement-breakpoint
CREATE TYPE "public"."doc_status" AS ENUM('rascunho', 'publicado', 'desatualizado');--> statement-breakpoint
CREATE TABLE "doc_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doc_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"action" "doc_action" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doc_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "doc_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "doc_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doc_id" uuid NOT NULL,
	"entity_type" "doc_link_type" NOT NULL,
	"entity_id" text NOT NULL,
	"entity_label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doc_tag_links" (
	"doc_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "doc_tag_links_pkey" PRIMARY KEY("doc_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "doc_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "doc_tags_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"content_md" text DEFAULT '' NOT NULL,
	"category_id" uuid NOT NULL,
	"status" "doc_status" DEFAULT 'rascunho' NOT NULL,
	"sector" text,
	"owner_user_id" uuid,
	"review_due_at" date,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "doc_activity" ADD CONSTRAINT "doc_activity_doc_id_docs_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_activity" ADD CONSTRAINT "doc_activity_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_links" ADD CONSTRAINT "doc_links_doc_id_docs_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_tag_links" ADD CONSTRAINT "doc_tag_links_doc_id_docs_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."docs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_tag_links" ADD CONSTRAINT "doc_tag_links_tag_id_doc_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."doc_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "docs" ADD CONSTRAINT "docs_category_id_doc_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."doc_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "docs" ADD CONSTRAINT "docs_owner_user_id_app_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "docs" ADD CONSTRAINT "docs_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "docs" ADD CONSTRAINT "docs_updated_by_app_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "doc_links_doc_id_idx" ON "doc_links" USING btree ("doc_id");--> statement-breakpoint
CREATE INDEX "doc_links_entity_type_entity_id_idx" ON "doc_links" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "doc_tag_links_tag_id_idx" ON "doc_tag_links" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "docs_category_id_idx" ON "docs" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "docs_status_idx" ON "docs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "docs_owner_user_id_idx" ON "docs" USING btree ("owner_user_id");--> statement-breakpoint

ALTER TABLE docs ADD COLUMN search_tsv tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(content_md, '')), 'C')
  ) STORED;--> statement-breakpoint

CREATE INDEX docs_search_idx ON docs USING GIN (search_tsv);--> statement-breakpoint

INSERT INTO doc_categories (name, slug, sort_order) VALUES
  ('Integração', 'integracao', 1),
  ('Processo interno', 'processo-interno', 2),
  ('Configuração', 'configuracao', 3),
  ('Troubleshooting', 'troubleshooting', 4),
  ('Homologação', 'homologacao', 5);