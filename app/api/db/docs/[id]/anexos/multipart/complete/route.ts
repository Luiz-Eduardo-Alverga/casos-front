import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import { docExists } from "@/lib/db/docs";
import { completeCaseAttachmentMultipartUpload } from "@/lib/storage/case-attachments";
import { getS3Client } from "@/lib/storage/s3";
import { completeMultipartBodySchema } from "@/lib/validators/db/case-attachments";
import { validateStoragePathForDoc } from "@/lib/validators/db/doc-attachments";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteCtx) {
  return withPermission("edit-doc", async () => {
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

    const parsed = completeMultipartBodySchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

    if (!validateStoragePathForDoc(parsed.data.path, docId)) {
      return jsonError("Caminho do arquivo inválido para este documento", 400);
    }

    try {
      getS3Client();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Storage indisponível";
      return jsonError(msg, 503);
    }

    try {
      if (!(await docExists(docId))) {
        return jsonError("Documento não encontrado", 404);
      }

      await completeCaseAttachmentMultipartUpload({
        objectPath: parsed.data.path,
        uploadId: parsed.data.uploadId,
        parts: parsed.data.parts,
      });
      return jsonOk({ completed: true });
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/docs/[id]/anexos/multipart/complete POST]",
      );
    }
  });
}
