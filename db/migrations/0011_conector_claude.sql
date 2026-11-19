CREATE TABLE "claude_conexoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_user_id" uuid NOT NULL,
	"cliente_id" text NOT NULL,
	"legacy_token_cifrado" text NOT NULL,
	"legacy_token_atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"access_token_hash" text,
	"access_expira_em" timestamp with time zone,
	"refresh_token_hash" text,
	"refresh_expira_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"ultimo_uso_em" timestamp with time zone,
	"revogado_em" timestamp with time zone,
	"motivo_revogacao" text,
	CONSTRAINT "claude_conexoes_access_token_hash_unique" UNIQUE("access_token_hash"),
	CONSTRAINT "claude_conexoes_refresh_token_hash_unique" UNIQUE("refresh_token_hash")
);
--> statement-breakpoint
CREATE TABLE "claude_previas_caso" (
	"id" text PRIMARY KEY NOT NULL,
	"conexao_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"resumo" jsonb NOT NULL,
	"expira_em" timestamp with time zone NOT NULL,
	"caso_registro" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_clientes" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"redirect_uris" text[] NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_codigos" (
	"codigo_hash" text PRIMARY KEY NOT NULL,
	"cliente_id" text NOT NULL,
	"conexao_id" uuid NOT NULL,
	"redirect_uri" text NOT NULL,
	"code_challenge" text NOT NULL,
	"expira_em" timestamp with time zone NOT NULL,
	"usado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "claude_conexoes" ADD CONSTRAINT "claude_conexoes_app_user_id_app_users_id_fk" FOREIGN KEY ("app_user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claude_conexoes" ADD CONSTRAINT "claude_conexoes_cliente_id_oauth_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."oauth_clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claude_previas_caso" ADD CONSTRAINT "claude_previas_caso_conexao_id_claude_conexoes_id_fk" FOREIGN KEY ("conexao_id") REFERENCES "public"."claude_conexoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_codigos" ADD CONSTRAINT "oauth_codigos_cliente_id_oauth_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."oauth_clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_codigos" ADD CONSTRAINT "oauth_codigos_conexao_id_claude_conexoes_id_fk" FOREIGN KEY ("conexao_id") REFERENCES "public"."claude_conexoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "claude_conexoes_app_user_id_idx" ON "claude_conexoes" USING btree ("app_user_id");--> statement-breakpoint
CREATE INDEX "claude_previas_caso_conexao_id_idx" ON "claude_previas_caso" USING btree ("conexao_id");