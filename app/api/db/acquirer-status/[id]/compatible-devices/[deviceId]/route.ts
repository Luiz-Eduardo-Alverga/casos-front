import {
  handleDbRouteError,
  jsonError,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import { getAcquirerStatusById } from "@/lib/db/acquirer-status";
import { deleteCompatibleDevicePair } from "@/lib/db/acquirer-compatible-devices";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = {
  params: Promise<{ id: string; deviceId: string }>;
};

export async function DELETE(_request: Request, context: RouteCtx) {
  return withPermission("edit-acquirer", async () => {
    const { id: statusId, deviceId } = await context.params;
    const statusParsed = uuidSchema.safeParse(statusId);
    if (!statusParsed.success) return badRequestFromZod(statusParsed.error);
    const deviceParsed = uuidSchema.safeParse(deviceId);
    if (!deviceParsed.success) return badRequestFromZod(deviceParsed.error);
    try {
      const status = await getAcquirerStatusById(statusParsed.data);
      if (!status) return jsonError("Status de adquirente não encontrado", 404);
      const removed = await deleteCompatibleDevicePair(
        statusParsed.data,
        deviceParsed.data,
      );
      if (!removed)
        return jsonError("Associação dispositivo/status não encontrada", 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/acquirer-status/.../compatible-devices/[deviceId] DELETE]",
      );
    }
  });
}
