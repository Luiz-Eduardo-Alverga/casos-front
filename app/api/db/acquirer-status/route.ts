import { handleDbRouteError, jsonError, jsonOk } from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import {
  insertAcquirerStatus,
  listAcquirerStatuses,
} from "@/lib/db/acquirer-status";
import { acquirerStatusCreateSchema } from "@/lib/validators/db/acquirer-status";

export async function GET() {
  return withSession(async () => {
    try {
      const rows = await listAcquirerStatuses();
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
      return jsonOk(row, 201);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/acquirer-status POST]");
    }
  });
}
