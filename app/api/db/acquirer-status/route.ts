import { handleDbRouteError, jsonError, jsonOk } from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import {
  getAcquirerStatusByAcquirerId,
  getAcquirerStatusBySortOrder,
  insertAcquirerStatus,
  listAcquirerStatus,
} from "@/lib/db/acquirer-status";
import { insertCompatibleDevice } from "@/lib/db/acquirer-compatible-devices";
import { acquirerStatusCreateSchema } from "@/lib/validators/db/acquirer-status";

export async function GET() {
  return withSession(async () => {
    try {
      const rows = await listAcquirerStatus();
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/acquirer-status GET]");
    }
  });
}

export async function POST(request: Request) {
  return withSession(async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = acquirerStatusCreateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    const d = parsed.data;
    try {
      const existingByAcquirer = await getAcquirerStatusByAcquirerId(
        d.acquirerId,
      );
      if (existingByAcquirer) {
        return jsonError(
          "A adquirente selecionada já possui um status cadastrado.",
          409,
        );
      }

      if (typeof d.sortOrder === "number") {
        const existingBySortOrder = await getAcquirerStatusBySortOrder(
          d.sortOrder,
        );
        if (existingBySortOrder) {
          return jsonError(
            "A ordem de exibição informada já está em uso.",
            409,
          );
        }
      }

      const row = await insertAcquirerStatus({
        acquirerId: d.acquirerId,
        currentVersionId: d.currentVersionId,
        status: d.status,
        nextVersionId: d.nextVersionId ?? undefined,
        deliveryDate: d.deliveryDate ?? undefined,
        recommendedDeviceId: d.recommendedDeviceId ?? undefined,
        sortOrder: d.sortOrder,
        isActive: d.isActive,
        obs: d.obs ?? undefined,
      });

      const compatibleDevices = d.compatibleDevices ?? [];
      const uniqueDeviceIds = new Set<string>();
      for (const device of compatibleDevices) {
        if (uniqueDeviceIds.has(device.deviceId)) continue;
        uniqueDeviceIds.add(device.deviceId);
        await insertCompatibleDevice({
          statusId: row.id,
          deviceId: device.deviceId,
          androidVersion: device.androidVersion ?? undefined,
        });
      }

      return jsonOk(row, 201);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/acquirer-status POST]");
    }
  });
}
