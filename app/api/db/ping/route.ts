import { sql } from "drizzle-orm";
import { db } from "@/db";
import { requireSessionAuth } from "@/lib/auth-server";
import { jsonError, jsonOk } from "@/lib/api-db/responses";

/**
 * Verifica sessão (cookie do login) e conectividade com o Postgres (Supabase).
 * Novas rotas em `app/api/db/*` devem usar o mesmo padrão com `requireSessionAuth`.
 */
export async function GET() {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  try {
    await db.execute(sql`select 1`);
  } catch (e) {
    console.error("[api/db/ping] Erro ao consultar o banco:", e);
    return jsonError("Falha ao acessar o banco", 503);
  }

  return jsonOk({ ok: true });
}
