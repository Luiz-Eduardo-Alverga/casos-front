import { handleDbRouteError, jsonOk } from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import {
  appUserToSummary,
  syncAppUserAndPermissions,
} from "@/lib/auth/sync-app-user";
import { updateAppUserReceberNotificacaoDiscord } from "@/lib/db/app-users";
import { patchNotificacaoDiscordSchema } from "@/lib/validators/db/notificacao-discord";

export async function GET() {
  return withSession(async (session) => {
    try {
      const { appUser } = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );
      return jsonOk({
        receberNotificacaoDiscord: appUser.receberNotificacaoDiscord,
      });
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/app-users/me/notificacao-discord GET]",
      );
    }
  });
}

export async function PATCH(request: Request) {
  return withSession(async (session) => {
    try {
      const body = await request.json().catch(() => null);
      const parsed = patchNotificacaoDiscordSchema.safeParse(body);
      if (!parsed.success) {
        return badRequestFromZod(parsed.error);
      }

      const { appUser } = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );
      const updated = await updateAppUserReceberNotificacaoDiscord(
        appUser.id,
        parsed.data.receberNotificacaoDiscord,
      );

      return jsonOk({
        receberNotificacaoDiscord: updated.receberNotificacaoDiscord,
        appUser: appUserToSummary(updated),
      });
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/app-users/me/notificacao-discord PATCH]",
      );
    }
  });
}
