import { requireSessionAuth } from "@/lib/auth-server";
import { syncAppUserAndPermissions } from "@/lib/auth/sync-app-user";

export const LIST_INDICADORES_ALL_PERMISSION = "list-indicadores-all";

type IndicadoresScopeResult =
  | {
      ok: true;
      authorizationHeader: { Authorization: string };
    }
  | { ok: false; response: Response };

/**
 * Garante sessão e, sem `list-indicadores-all`, restringe o `suporte_id` ao usuário logado.
 */
export async function assertIndicadoresSuporteScope(
  suporteId: string | number,
): Promise<IndicadoresScopeResult> {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) {
    return {
      ok: false,
      response: Response.json({ error: "Não autorizado" }, { status: 401 }),
    };
  }

  const sync = await syncAppUserAndPermissions(auth.authorizationHeader);
  const canViewAll = sync.permissions.includes(LIST_INDICADORES_ALL_PERMISSION);
  const requestedId = String(suporteId).trim();
  const isSelf = String(sync.appUser.legacyUserId) === requestedId;

  if (!canViewAll && !isSelf) {
    return {
      ok: false,
      response: Response.json(
        {
          error:
            "Sem permissão para consultar indicadores de outros colaboradores",
        },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true,
    authorizationHeader: auth.authorizationHeader,
  };
}
