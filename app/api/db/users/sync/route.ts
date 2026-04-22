import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { withSession } from "@/lib/api-db/with-session";
import {
  appUserToSummary,
  syncAppUserAndPermissions,
  SyncAppUserValidationError,
} from "@/lib/auth/sync-app-user";
import { LegacyAuthMeError } from "@/lib/legacy-auth/me";

export async function POST() {
  return withSession(async (session) => {
    try {
      const result = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );
      return jsonOk({
        appUser: appUserToSummary(result.appUser),
        permissions: result.permissions,
      });
    } catch (e) {
      if (e instanceof LegacyAuthMeError) {
        const status = e.statusCode >= 400 && e.statusCode < 600 ? e.statusCode : 502;
        return jsonError(e.message, status);
      }
      if (e instanceof SyncAppUserValidationError) {
        return jsonError(e.message, 502);
      }
      return handleDbRouteError(e, "[api/db/users/sync POST]");
    }
  });
}
