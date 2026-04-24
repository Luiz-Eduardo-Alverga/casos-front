import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import { insertDevice, listDevices } from "@/lib/db/devices";
import { deviceCreateSchema } from "@/lib/validators/db/devices";

export async function GET(request: Request) {
  return withPermission("list-acquirer", async () => {
    try {
      const search = new URL(request.url).searchParams.get("search") ?? undefined;
      const rows = await listDevices(search);
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/devices GET]");
    }
  });
}

export async function POST(request: Request) {
  return withPermission("create-acquirer", async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = deviceCreateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      const row = await insertDevice({ name: parsed.data.name });
      return jsonOk(row, 201);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/devices POST]");
    }
  });
}
