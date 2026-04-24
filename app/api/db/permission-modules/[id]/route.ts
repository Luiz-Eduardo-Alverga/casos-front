import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import {
  deletePermissionModule,
  getPermissionModuleById,
  getPermissionModuleByIdWithPermissions,
  updatePermissionModule,
} from "@/lib/db/permission-modules";
import { permissionModuleUpdateSchema } from "@/lib/validators/db/permission-modules";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    const expand = new URL(request.url).searchParams.get("expand");
    try {
      if (expand === "permissions") {
        const row = await getPermissionModuleByIdWithPermissions(idParsed.data);
        if (!row) return jsonError("Módulo não encontrado", 404);
        return jsonOk(row);
      }
      const row = await getPermissionModuleById(idParsed.data);
      if (!row) return jsonError("Módulo não encontrado", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/permission-modules/[id] GET]");
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
    const parsed = permissionModuleUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      const row = await updatePermissionModule(idParsed.data, parsed.data);
      if (!row) return jsonError("Módulo não encontrado", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/permission-modules/[id] PATCH]");
    }
  });
}

export async function DELETE(_request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const removed = await deletePermissionModule(idParsed.data);
      if (!removed) return jsonError("Módulo não encontrado", 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/permission-modules/[id] DELETE]");
    }
  });
}
