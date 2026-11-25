import { handleDbRouteError, jsonOk } from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import { syncAppUserAndPermissions } from "@/lib/auth/sync-app-user";
import {
  getBrainiacConector,
  getMcpResourceUrl,
  type TipoCliente,
} from "@/lib/conector-claude/config";
import {
  listConexoesAtivasByAppUserId,
  revogarConexoesDoUsuario,
} from "@/lib/db/claude-conector";
import { claudeConexaoDeleteQuerySchema } from "@/lib/validators/db/claude-conector";

/**
 * Status das conexões com o Claude da pessoa logada (modal "Conexão com o Claude"): uma por tipo
 * de cliente, Claude (app e web) e Claude Code (decisão #25).
 */
export async function GET() {
  return withSession(async (session) => {
    try {
      const { appUser, permissions } = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );
      const ativas = await listConexoesAtivasByAppUserId(appUser.id);
      // Ordenadas da mais recente: a primeira de cada tipo é a ativa (há no máximo uma).
      const porTipo = new Map<string, (typeof ativas)[number]>();
      for (const c of ativas) if (!porTipo.has(c.tipoCliente)) porTipo.set(c.tipoCliente, c);
      const conexoes = [...porTipo.values()].map((c) => ({
        tipo: c.tipoCliente as TipoCliente,
        conectadoEm: c.criadoEm.toISOString(),
        ultimoUsoEm: c.ultimoUsoEm?.toISOString() ?? null,
      }));
      return jsonOk({
        conectado: conexoes.length > 0,
        conexoes,
        podeAbrirCaso: permissions.includes("create-case"),
        enderecoConector: getMcpResourceUrl(),
        brainiac: getBrainiacConector(),
      });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/claude-conexao GET]");
    }
  });
}

/** Desconectar: `?tipo=claude|claude-code` revoga só aquele tipo; sem `tipo`, todas. */
export async function DELETE(request: Request) {
  return withSession(async (session) => {
    const query = claudeConexaoDeleteQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!query.success) return badRequestFromZod(query.error);
    const { tipo } = query.data;
    try {
      const { appUser } = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );
      const revogadas = await revogarConexoesDoUsuario(appUser.id, "usuario", tipo);
      console.info(
        `[conector-claude] Desconectado pela pessoa: app_user=${appUser.id} tipo=${tipo ?? "todos"} conexoes=${revogadas}`,
      );
      return jsonOk({ revogadas });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/claude-conexao DELETE]");
    }
  });
}
