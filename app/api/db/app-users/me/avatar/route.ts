import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import { appUserToSummary, syncAppUserAndPermissions } from "@/lib/auth/sync-app-user";
import {
  clearAppUserAvatar,
  updateAppUserAvatar,
} from "@/lib/db/app-users";
import {
  createUserAvatarSignedDownloadUrl,
  getUserAvatarObjectInfo,
  removeUserAvatarObject,
} from "@/lib/storage/user-avatar";
import { getSupabaseServiceRoleClient } from "@/lib/storage/supabase";
import {
  finalizeAvatarBodySchema,
  validateAvatarStoragePathForUser,
} from "@/lib/validators/db/user-avatar";

export async function GET() {
  return withSession(async (session) => {
    try {
      const { appUser } = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );

      if (!appUser.avatarPath) {
        return jsonOk({ avatarUrl: null, avatarPath: null });
      }

      try {
        getSupabaseServiceRoleClient();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Storage indisponível";
        return jsonError(msg, 503);
      }

      const avatarUrl = await createUserAvatarSignedDownloadUrl(
        appUser.avatarPath,
      );

      return jsonOk({
        avatarUrl,
        avatarPath: appUser.avatarPath,
        avatarUpdatedAt: appUser.avatarUpdatedAt?.toISOString() ?? null,
      });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/app-users/me/avatar GET]");
    }
  });
}

export async function PUT(request: Request) {
  return withSession(async (session) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }

    const parsed = finalizeAvatarBodySchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

    try {
      getSupabaseServiceRoleClient();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Storage indisponível";
      return jsonError(msg, 503);
    }

    try {
      const { appUser } = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );

      if (!validateAvatarStoragePathForUser(parsed.data.path, appUser.id)) {
        return jsonError("Caminho do arquivo inválido para este usuário", 400);
      }

      const info = await getUserAvatarObjectInfo(parsed.data.path);
      if (!info || info.size <= 0) {
        return jsonError(
          "Arquivo não encontrado no storage. Conclua o upload antes de finalizar.",
          400,
        );
      }

      if (info.size !== parsed.data.sizeBytes) {
        return jsonError(
          "Tamanho do arquivo no storage não confere com o envio",
          400,
        );
      }

      if (
        info.mimeType &&
        info.mimeType.toLowerCase() !== parsed.data.mimeType.toLowerCase()
      ) {
        return jsonError("Tipo do arquivo no storage não confere", 400);
      }

      if (
        appUser.avatarPath &&
        appUser.avatarPath !== parsed.data.path
      ) {
        try {
          await removeUserAvatarObject(appUser.avatarPath);
        } catch (storageErr) {
          console.warn(
            "[api/db/app-users/me/avatar PUT] falha ao remover avatar antigo",
            storageErr,
          );
        }
      }

      const updated = await updateAppUserAvatar(appUser.id, parsed.data.path);
      const avatarUrl = await createUserAvatarSignedDownloadUrl(updated.avatarPath!);

      return jsonOk({
        appUser: appUserToSummary(updated),
        avatarUrl,
      });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/app-users/me/avatar PUT]");
    }
  });
}

export async function DELETE() {
  return withSession(async (session) => {
    try {
      getSupabaseServiceRoleClient();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Storage indisponível";
      return jsonError(msg, 503);
    }

    try {
      const { appUser } = await syncAppUserAndPermissions(
        session.authorizationHeader,
      );

      if (appUser.avatarPath) {
        try {
          await removeUserAvatarObject(appUser.avatarPath);
        } catch (storageErr) {
          console.warn(
            "[api/db/app-users/me/avatar DELETE] falha ao remover do storage",
            storageErr,
          );
        }
      }

      const updated = await clearAppUserAvatar(appUser.id);

      return jsonOk({
        appUser: appUserToSummary(updated),
        avatarUrl: null,
      });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/app-users/me/avatar DELETE]");
    }
  });
}
