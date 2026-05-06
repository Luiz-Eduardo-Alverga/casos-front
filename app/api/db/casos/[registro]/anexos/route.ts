import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import {
  CASE_ATTACHMENTS_BUCKET,
  MAX_ATTACHMENTS_PER_CASE,
} from "@/lib/constants/case-attachments";
import {
  getAppUserByLegacyUserId,
} from "@/lib/db/app-users";
import {
  countCaseAttachmentsByRegistro,
  insertCaseAttachment,
  listCaseAttachmentsByRegistro,
} from "@/lib/db/case-attachments";
import { getLegacyUserFromToken } from "@/lib/legacy-auth/me";
import {
  createCaseAttachmentSignedDownloadUrl,
  getCaseAttachmentObjectInfo,
} from "@/lib/storage/case-attachments";
import { getSupabaseServiceRoleClient } from "@/lib/storage/supabase";
import { legacyUserSchema } from "@/lib/validators/db/legacy-user";
import {
  casoRegistroParamSchema,
  classifyAttachmentKind,
  finalizeAttachmentBodySchema,
  validateStoragePathForRegistro,
} from "@/lib/validators/db/case-attachments";

type RouteCtx = { params: Promise<{ registro: string }> };

export async function GET(_request: Request, context: RouteCtx) {
  return withPermission("list-case-attachment", async () => {
    const { registro: registroRaw } = await context.params;
    const registroParsed = casoRegistroParamSchema.safeParse(registroRaw);
    if (!registroParsed.success) return badRequestFromZod(registroParsed.error);
    const casoRegistro = registroParsed.data;

    try {
      getSupabaseServiceRoleClient();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Storage indisponível";
      return jsonError(msg, 503);
    }

    try {
      const rows = await listCaseAttachmentsByRegistro(casoRegistro);
      const withUrls = await Promise.all(
        rows.map(async (row) => {
          const downloadUrl = await createCaseAttachmentSignedDownloadUrl(
            row.path,
          );
          return {
            id: row.id,
            casoRegistro: row.casoRegistro,
            bucket: row.bucket,
            path: row.path,
            filenameOriginal: row.filenameOriginal,
            mimeType: row.mimeType,
            sizeBytes: row.sizeBytes,
            kind: row.kind,
            createdBy: row.createdBy,
            createdAt: row.createdAt,
            downloadUrl,
          };
        }),
      );
      return jsonOk(withUrls);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/casos/[registro]/anexos GET]");
    }
  });
}

export async function POST(request: Request, context: RouteCtx) {
  return withPermission("create-case-attachment", async (session) => {
    const { registro: registroRaw } = await context.params;
    const registroParsed = casoRegistroParamSchema.safeParse(registroRaw);
    if (!registroParsed.success) return badRequestFromZod(registroParsed.error);
    const casoRegistro = registroParsed.data;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }

    const parsed = finalizeAttachmentBodySchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

    if (!validateStoragePathForRegistro(parsed.data.path, casoRegistro)) {
      return jsonError("Caminho do arquivo inválido para este caso", 400);
    }

    try {
      getSupabaseServiceRoleClient();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Storage indisponível";
      return jsonError(msg, 503);
    }

    try {
      const current = await countCaseAttachmentsByRegistro(casoRegistro);
      if (current >= MAX_ATTACHMENTS_PER_CASE) {
        return jsonError(
          `Limite de ${MAX_ATTACHMENTS_PER_CASE} anexos por caso atingido`,
          400,
        );
      }

      const info = await getCaseAttachmentObjectInfo(parsed.data.path);
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

      const rawUser = await getLegacyUserFromToken(session.authorizationHeader);
      const userParsed = legacyUserSchema.safeParse(rawUser);
      if (!userParsed.success) {
        return jsonError("Não foi possível identificar o usuário", 502);
      }

      const appUser = await getAppUserByLegacyUserId(userParsed.data.id);
      if (!appUser) {
        return jsonError("Usuário local não encontrado", 500);
      }

      const row = await insertCaseAttachment({
        casoRegistro,
        bucket: CASE_ATTACHMENTS_BUCKET,
        path: parsed.data.path,
        filenameOriginal: parsed.data.filenameOriginal,
        mimeType: parsed.data.mimeType,
        sizeBytes: parsed.data.sizeBytes,
        kind: classifyAttachmentKind(parsed.data.mimeType),
        createdBy: appUser.id,
      });

      const downloadUrl = await createCaseAttachmentSignedDownloadUrl(row.path);

      return jsonOk(
        {
          ...row,
          downloadUrl,
        },
        201,
      );
    } catch (e) {
      return handleDbRouteError(e, "[api/db/casos/[registro]/anexos POST]");
    }
  });
}
