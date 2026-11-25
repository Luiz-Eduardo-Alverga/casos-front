import { handleDbRouteError, jsonOk } from "@/lib/api-db/responses";
import { withSession } from "@/lib/api-db/with-session";
import { syncAppUserAndPermissions } from "@/lib/auth/sync-app-user";
import {
  getBrainiacConector,
  getMcpResourceUrl,
} from "@/lib/conector-claude/config";
import {
  getConexaoAtivaByAppUserId,
  revogarConexoesDoUsuario,
} from "@/lib/db/claude-conector";

/** Status da conexão com o Claude da pessoa logada (modal "Conexão com o Claude"). */
export async function GET() {
  return withSession(async (session) => {
    try {
      const { appUser, permissions } = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );
      const conexao = await getConexaoAtivaByAppUserId(appUser.id);
      return jsonOk({
        conectado: conexao != null,
        conectadoEm: conexao?.criadoEm.toISOString() ?? null,
        ultimoUsoEm: conexao?.ultimoUsoEm?.toISOString() ?? null,
        podeAbrirCaso: permissions.includes("create-case"),
        enderecoConector: getMcpResourceUrl(),
        brainiac: getBrainiacConector(),
      });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/claude-conexao GET]");
    }
  });
}

/** Desconectar: revoga na hora todas as conexões (e tokens) da pessoa. */
export async function DELETE() {
  return withSession(async (session) => {
    try {
      const { appUser } = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );
      const revogadas = await revogarConexoesDoUsuario(appUser.id, "usuario");
      console.info(
        `[conector-claude] Desconectado pela pessoa: app_user=${appUser.id} conexoes=${revogadas}`,
      );
      return jsonOk({ revogadas });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/claude-conexao DELETE]");
    }
  });
}
