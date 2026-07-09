import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import { syncAppUserAndPermissions } from "@/lib/auth/sync-app-user";
import { USER_AVATAR_BUCKET } from "@/lib/constants/user-avatar";
import { createUserAvatarSignedUpload } from "@/lib/storage/user-avatar";
import { getSupabaseServiceRoleClient } from "@/lib/storage/supabase";
import {
  buildUserAvatarObjectPath,
  presignAvatarBodySchema,
} from "@/lib/validators/db/user-avatar";

export async function POST(request: Request) {
  return withSession(async (session) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }

    const parsed = presignAvatarBodySchema.safeParse(body);
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
      const objectPath = buildUserAvatarObjectPath(
        appUser.id,
        parsed.data.filename,
      );
      const signed = await createUserAvatarSignedUpload(objectPath);

      return jsonOk({
        bucket: USER_AVATAR_BUCKET,
        path: signed.path,
        uploadUrl: signed.uploadUrl,
        token: signed.token,
      });
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/app-users/me/avatar/presign-upload POST]",
      );
    }
  });
}
