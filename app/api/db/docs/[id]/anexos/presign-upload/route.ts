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
  MAX_ATTACHMENTS_PER_DOC,
} from "@/lib/constants/case-attachments";
import { countDocAttachmentsByDocId } from "@/lib/db/doc-attachments";
import { docExists } from "@/lib/db/docs";
import {
  attachmentUsesMultipart,
  createCaseAttachmentMultipartUpload,
  createCaseAttachmentSignedUpload,
} from "@/lib/storage/case-attachments";
import { getS3Client } from "@/lib/storage/s3";
import { presignUploadBodySchema } from "@/lib/validators/db/case-attachments";
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

    const parsed = presignUploadBodySchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

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

      const current = await countDocAttachmentsByDocId(docId);
      if (current >= MAX_ATTACHMENTS_PER_DOC) {
        return jsonError(
          `Limite de ${MAX_ATTACHMENTS_PER_DOC} anexos por documento atingido`,
          400,
        );
      }

      const ext =
        parsed.data.filename.split(".").pop()?.toLowerCase().trim() ?? "";
      if (!ext) {
        return jsonError("Nome de arquivo sem extensão", 400);
      }

      const objectPath = `docs/${docId}/${randomUUID()}.${ext}`;

      if (attachmentUsesMultipart(parsed.data.sizeBytes)) {
        const session = await createCaseAttachmentMultipartUpload({
          objectPath,
          contentType: parsed.data.mimeType,
          sizeBytes: parsed.data.sizeBytes,
        });
        return jsonOk({
          mode: "multipart" as const,
          bucket: CASE_ATTACHMENTS_BUCKET,
          path: session.path,
          uploadId: session.uploadId,
          partSize: session.partSize,
          parts: session.parts,
        });
      }

      const signed = await createCaseAttachmentSignedUpload(
        objectPath,
        parsed.data.mimeType,
      );

      return jsonOk({
        mode: "single" as const,
        bucket: CASE_ATTACHMENTS_BUCKET,
        path: signed.path,
        uploadUrl: signed.uploadUrl,
        token: signed.token,
      });
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/docs/[id]/anexos/presign-upload POST]",
      );
    }
  });
}
