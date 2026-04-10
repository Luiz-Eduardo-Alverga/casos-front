import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import { getAcquirerStatusById } from "@/lib/db/acquirer-status";
import {
  deleteCompatibleDevicePair,
  insertCompatibleDevice,
  listCompatibleDevicesByStatusId,
} from "@/lib/db/acquirer-compatible-devices";
import {
  compatibleDeviceLinkBodySchema,
} from "@/lib/validators/db/acquirer-compatible-devices";
import { uuidSchema } from "@/lib/validators/db/shared";

/**
 * Recurso plano para `acquirer_compatible_devices`.
 * Alternativa às rotas aninhadas em `acquirer-status/[id]/compatible-devices`.
 */
export async function GET(request: Request) {
  return withSession(async () => {
    const statusIdRaw = new URL(request.url).searchParams.get("statusId");
    if (!statusIdRaw?.trim()) {
      return jsonError("Query obrigatória: statusId", 400);
    }
    const idParsed = uuidSchema.safeParse(statusIdRaw.trim());
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const status = await getAcquirerStatusById(idParsed.data);
      if (!status) return jsonError("Status de adquirente não encontrado", 404);
      const rows = await listCompatibleDevicesByStatusId(idParsed.data);
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/acquirer-compatible-devices GET]",
      );
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
    const parsed = compatibleDeviceLinkBodySchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    const d = parsed.data;
    try {
      const status = await getAcquirerStatusById(d.statusId);
      if (!status) return jsonError("Status de adquirente não encontrado", 404);
      const row = await insertCompatibleDevice({
        statusId: d.statusId,
        deviceId: d.deviceId,
        androidVersion: d.androidVersion ?? undefined,
      });
      return jsonOk(row, 201);
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/acquirer-compatible-devices POST]",
      );
    }
  });
}

export async function DELETE(request: Request) {
  return withSession(async () => {
    const sp = new URL(request.url).searchParams;
    const statusIdRaw = sp.get("statusId");
    const deviceIdRaw = sp.get("deviceId");
    if (!statusIdRaw?.trim() || !deviceIdRaw?.trim()) {
      return jsonError("Queries obrigatórias: statusId e deviceId", 400);
    }
    const statusParsed = uuidSchema.safeParse(statusIdRaw.trim());
    if (!statusParsed.success) return badRequestFromZod(statusParsed.error);
    const deviceParsed = uuidSchema.safeParse(deviceIdRaw.trim());
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
        "[api/db/acquirer-compatible-devices DELETE]",
      );
    }
  });
}
