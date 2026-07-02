import { jsonOk, handleDbRouteError } from "@/lib/api-db/responses";
import { withSession } from "@/lib/api-db/with-session";
import { syncAppUserAndPermissions } from "@/lib/auth/sync-app-user";
import { getMinHierarchyLevelForUserId } from "@/lib/db/app-users";

/** Retorna hierarquia efetiva do usuário autenticado (para UI de delegação). */
export async function GET() {
  return withSession(async ({ authorizationHeader }) => {
    try {
      const sync = await syncAppUserAndPermissions(authorizationHeader);
      const hierarchyLevel = await getMinHierarchyLevelForUserId(
        sync.appUser.id,
      );
      return jsonOk({
        appUserId: sync.appUser.id,
        hierarchyLevel,
      });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/app-users/me/hierarchy GET]");
    }
  });
}
