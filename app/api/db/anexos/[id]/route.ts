import {
  handleDbRouteError,
  jsonError,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import {
  deleteCaseAttachmentById,
  getCaseAttachmentById,
} from "@/lib/db/case-attachments";
import { removeCaseAttachmentObject } from "@/lib/storage/case-attachments";
import { getSupabaseServiceRoleClient } from "@/lib/storage/supabase";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteCtx) {
  return withPermission("delete-case-attachment", async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);

    try {
      getSupabaseServiceRoleClient();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Storage indisponível";
      return jsonError(msg, 503);
    }

    try {
      const existing = await getCaseAttachmentById(idParsed.data);
      if (!existing) return jsonError("Anexo não encontrado", 404);

      try {
        await removeCaseAttachmentObject(existing.path);
      } catch (storageErr) {
        console.warn(
          "[api/db/anexos/[id] DELETE] falha ao remover objeto do storage",
          storageErr,
        );
      }

      const deleted = await deleteCaseAttachmentById(idParsed.data);
      if (!deleted) return jsonError("Anexo não encontrado", 404);

      return new Response(null, { status: 204 });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/anexos/[id] DELETE]");
    }
  });
}
