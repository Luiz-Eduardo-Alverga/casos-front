import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import {
  deleteDevice,
  getDeviceById,
  updateDevice,
} from "@/lib/db/devices";
import { deviceUpdateSchema } from "@/lib/validators/db/devices";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteCtx) {
  return withPermission("list-acquirer", async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const row = await getDeviceById(idParsed.data);
      if (!row) return jsonError("Dispositivo não encontrado", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/devices/[id] GET]");
    }
  });
}

export async function PATCH(request: Request, context: RouteCtx) {
  return withPermission("edit-acquirer", async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = deviceUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      const row = await updateDevice(idParsed.data, parsed.data);
      if (!row) return jsonError("Dispositivo não encontrado", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/devices/[id] PATCH]");
    }
  });
}

export async function DELETE(_request: Request, context: RouteCtx) {
  return withPermission("delete-acquirer", async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const removed = await deleteDevice(idParsed.data);
      if (!removed) return jsonError("Dispositivo não encontrado", 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/devices/[id] DELETE]");
    }
  });
}
