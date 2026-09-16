import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import {
  CASE_ATTACHMENTS_BUCKET,
  MAX_ATTACHMENTS_PER_DOC,
} from "@/lib/constants/case-attachments";
import {
  getAppUserByLegacyUserId,
} from "@/lib/db/app-users";
import {
  countDocAttachmentsByDocId,
  insertDocAttachment,
  listDocAttachmentsByDocId,
} from "@/lib/db/doc-attachments";
import { docExists } from "@/lib/db/docs";
import { getLegacyUserFromToken } from "@/lib/legacy-auth/me";
import {
  createCaseAttachmentSignedDownloadUrl,
  getCaseAttachmentObjectInfo,
} from "@/lib/storage/case-attachments";
import { getSupabaseServiceRoleClient } from "@/lib/storage/supabase";
import { legacyUserSchema } from "@/lib/validators/db/legacy-user";
import {
  classifyAttachmentKind,
  finalizeAttachmentBodySchema,
} from "@/lib/validators/db/case-attachments";
import { validateStoragePathForDoc } from "@/lib/validators/db/doc-attachments";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteCtx) {
  return withPermission("list-doc", async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    const docId = idParsed.data;

    try {
      getSupabaseServiceRoleClient();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Storage indisponível";
      return jsonError(msg, 503);
    }

    try {
      if (!(await docExists(docId))) {
        return jsonError("Documento não encontrado", 404);
      }

      const attachments = await listDocAttachmentsByDocId(docId);
      const withUrls = await Promise.all(
        attachments.map(async (row) => {
          const downloadUrl = await createCaseAttachmentSignedDownloadUrl(
            row.path,
          );
          return {
            id: row.id,
            docId: row.docId,
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
      return handleDbRouteError(e, "[api/db/docs/[id]/anexos GET]");
    }
  });
}

export async function POST(request: Request, context: RouteCtx) {
  return withPermission("edit-doc", async (session) => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    const docId = idParsed.data;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }

    const parsed = finalizeAttachmentBodySchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

    if (!validateStoragePathForDoc(parsed.data.path, docId)) {
      return jsonError("Caminho do arquivo inválido para este documento", 400);
    }

    try {
      getSupabaseServiceRoleClient();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Storage indisponível";
      return jsonError(msg, 503);
    }

    try {
      if (!(await docExists(docId))) {
        return jsonError("Documento não encontrado", 404);
      }

      const current = await countDocAttachmentsByDocId(docId);
      if (current >= MAX_ATTACHMENTS_PER_DOC) {
        return jsonError(
          `Limite de ${MAX_ATTACHMENTS_PER_DOC} anexos por documento atingido`,
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

      const row = await insertDocAttachment({
        docId,
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
      return handleDbRouteError(e, "[api/db/docs/[id]/anexos POST]");
    }
  });
}
