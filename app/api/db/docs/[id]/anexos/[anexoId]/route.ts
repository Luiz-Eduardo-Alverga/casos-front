import {
  handleDbRouteError,
  jsonError,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import {
  deleteDocAttachmentById,
  getDocAttachmentById,
} from "@/lib/db/doc-attachments";
import { removeCaseAttachmentObject } from "@/lib/storage/case-attachments";
import { getSupabaseServiceRoleClient } from "@/lib/storage/supabase";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string; anexoId: string }> };

export async function DELETE(_request: Request, context: RouteCtx) {
  return withPermission("edit-doc", async () => {
    const { id, anexoId } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    const anexoParsed = uuidSchema.safeParse(anexoId);
    if (!anexoParsed.success) return badRequestFromZod(anexoParsed.error);

    try {
      getSupabaseServiceRoleClient();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Storage indisponível";
      return jsonError(msg, 503);
    }

    try {
      const existing = await getDocAttachmentById(anexoParsed.data);
      if (!existing || existing.docId !== idParsed.data) {
        return jsonError("Anexo não encontrado", 404);
      }

      try {
        await removeCaseAttachmentObject(existing.path);
      } catch (storageErr) {
        console.warn(
          "[api/db/docs/[id]/anexos/[anexoId] DELETE] falha ao remover objeto do storage",
          storageErr,
        );
      }

      const deleted = await deleteDocAttachmentById(
        anexoParsed.data,
        idParsed.data,
      );
      if (!deleted) return jsonError("Anexo não encontrado", 404);

      return new Response(null, { status: 204 });
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/docs/[id]/anexos/[anexoId] DELETE]",
      );
    }
  });
}
