import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import {
  deletePermission,
  getPermissionById,
  getPermissionByIdWithModule,
  updatePermission,
} from "@/lib/db/permissions";
import { permissionUpdateSchema } from "@/lib/validators/db/permissions";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    const expand = new URL(request.url).searchParams.get("expand");
    try {
      if (expand === "module") {
        const row = await getPermissionByIdWithModule(idParsed.data);
        if (!row) return jsonError("Permissão não encontrada", 404);
        return jsonOk(row);
      }
      const row = await getPermissionById(idParsed.data);
      if (!row) return jsonError("Permissão não encontrada", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/permissions/[id] GET]");
    }
  });
}

export async function PATCH(request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = permissionUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      const row = await updatePermission(idParsed.data, parsed.data);
      if (!row) return jsonError("Permissão não encontrada", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/permissions/[id] PATCH]");
    }
  });
}

export async function DELETE(_request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const removed = await deletePermission(idParsed.data);
      if (!removed) return jsonError("Permissão não encontrada", 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/permissions/[id] DELETE]");
    }
  });
}
