import { badRequestFromZod } from "@/lib/api-db/parse";
import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { withPermission } from "@/lib/api-db/with-permission";
import { deleteDoc, getDocById, updateDoc } from "@/lib/db/docs";
import { updateDocSchema } from "@/lib/validators/db/doc";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteCtx) {
  return withPermission("list-doc", async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const doc = await getDocById(idParsed.data);
      if (!doc) return jsonError("Documento não encontrado", 404);
      return jsonOk(doc);
    } catch (error) {
      return handleDbRouteError(error, "[api/db/docs/[id] GET]");
    }
  });
}

export async function PATCH(request: Request, context: RouteCtx) {
  return withPermission("edit-doc", async (session) => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = updateDocSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      const doc = await updateDoc(
        idParsed.data,
        parsed.data,
        session.appUserId,
      );
      if (!doc) return jsonError("Documento não encontrado", 404);
      return jsonOk(doc);
    } catch (error) {
      return handleDbRouteError(error, "[api/db/docs/[id] PATCH]");
    }
  });
}

export async function DELETE(_request: Request, context: RouteCtx) {
  return withPermission("delete-doc", async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const removed = await deleteDoc(idParsed.data);
      if (!removed) return jsonError("Documento não encontrado", 404);
      return new Response(null, { status: 204 });
    } catch (error) {
      return handleDbRouteError(error, "[api/db/docs/[id] DELETE]");
    }
  });
}
