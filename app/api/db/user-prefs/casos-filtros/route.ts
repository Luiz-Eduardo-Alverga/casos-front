import { handleDbRouteError, jsonError, jsonOk } from "@/lib/api-db/responses";
import { withSession } from "@/lib/api-db/with-session";
import { syncAppUserAndPermissions } from "@/lib/auth/sync-app-user";
import {
  getUserFiltrosPreferencias,
  upsertUserFiltrosPreferencias,
} from "@/lib/db/user-filtros-preferencias";
import { upsertFiltrosResumoSchema } from "@/lib/validators/db/user-filtros-preferencias";

export async function GET() {
  return withSession(async (session) => {
    try {
      const { appUser } = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );
      const filtros = await getUserFiltrosPreferencias(appUser.id);
      return jsonOk(filtros);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/user-prefs/casos-filtros GET]");
    }
  });
}

export async function PUT(request: Request) {
  return withSession(async (session) => {
    try {
      const body = await request.json().catch(() => null);
      const parsed = upsertFiltrosResumoSchema.safeParse(body);
      if (!parsed.success) {
        return jsonError(parsed.error.errors[0]?.message ?? "Payload inválido", 422);
      }

      const { appUser } = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );
      await upsertUserFiltrosPreferencias(appUser.id, parsed.data);
      return jsonOk({ success: true });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/user-prefs/casos-filtros PUT]");
    }
  });
}
