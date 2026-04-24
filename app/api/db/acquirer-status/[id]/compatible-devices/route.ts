import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import { getAcquirerStatusById } from "@/lib/db/acquirer-status";
import {
  insertCompatibleDevice,
  listCompatibleDevicesByStatusId,
} from "@/lib/db/acquirer-compatible-devices";
import { compatibleDeviceCreateSchema } from "@/lib/validators/db/acquirer-compatible-devices";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteCtx) {
  return withPermission("list-acquirer", async () => {
    const { id: statusId } = await context.params;
    const idParsed = uuidSchema.safeParse(statusId);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const status = await getAcquirerStatusById(idParsed.data);
      if (!status) return jsonError("Status de adquirente não encontrado", 404);
      const rows = await listCompatibleDevicesByStatusId(idParsed.data);
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/acquirer-status/[id]/compatible-devices GET]",
      );
    }
  });
}

export async function POST(request: Request, context: RouteCtx) {
  return withPermission("edit-acquirer", async () => {
    const { id: statusId } = await context.params;
    const idParsed = uuidSchema.safeParse(statusId);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = compatibleDeviceCreateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      const status = await getAcquirerStatusById(idParsed.data);
      if (!status) return jsonError("Status de adquirente não encontrado", 404);
      const row = await insertCompatibleDevice({
        statusId: idParsed.data,
        deviceId: parsed.data.deviceId,
        androidVersion: parsed.data.androidVersion ?? undefined,
      });
      return jsonOk(row, 201);
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/acquirer-status/[id]/compatible-devices POST]",
      );
    }
  });
}
