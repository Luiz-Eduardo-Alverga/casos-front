import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import { abortCaseAttachmentMultipartUpload } from "@/lib/storage/case-attachments";
import { getS3Client } from "@/lib/storage/s3";
import {
  abortMultipartBodySchema,
  casoRegistroParamSchema,
  validateStoragePathForRegistro,
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

    const parsed = abortMultipartBodySchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

    if (!validateStoragePathForRegistro(parsed.data.path, casoRegistro)) {
      return jsonError("Caminho do arquivo inválido para este caso", 400);
    }

    try {
      getS3Client();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Storage indisponível";
      return jsonError(msg, 503);
    }

    try {
      await abortCaseAttachmentMultipartUpload(
        parsed.data.path,
        parsed.data.uploadId,
      );
      return jsonOk({ aborted: true });
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/casos/[registro]/anexos/multipart/abort POST]",
      );
    }
  });
}
