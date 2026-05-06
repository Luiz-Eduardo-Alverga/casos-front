import { randomUUID } from "node:crypto";
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
import { countCaseAttachmentsByRegistro } from "@/lib/db/case-attachments";
import { createCaseAttachmentSignedUpload } from "@/lib/storage/case-attachments";
import { getSupabaseServiceRoleClient } from "@/lib/storage/supabase";
import {
  casoRegistroParamSchema,
  presignUploadBodySchema,
} from "@/lib/validators/db/case-attachments";

type RouteCtx = { params: Promise<{ registro: string }> };

export async function POST(request: Request, context: RouteCtx) {
  return withPermission("create-case-attachment", async () => {
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

    const parsed = presignUploadBodySchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

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

      const ext =
        parsed.data.filename.split(".").pop()?.toLowerCase().trim() ?? "";
      if (!ext) {
        return jsonError("Nome de arquivo sem extensão", 400);
      }

      const objectPath = `casos/${casoRegistro}/${randomUUID()}.${ext}`;
      const signed = await createCaseAttachmentSignedUpload(objectPath);

      return jsonOk({
        bucket: CASE_ATTACHMENTS_BUCKET,
        path: signed.path,
        uploadUrl: signed.uploadUrl,
        token: signed.token,
      });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/casos/[registro]/anexos/presign-upload POST]");
    }
  });
}
