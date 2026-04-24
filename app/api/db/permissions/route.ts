import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import { insertPermission, listPermissions } from "@/lib/db/permissions";
import { permissionCreateSchema } from "@/lib/validators/db/permissions";
import { uuidSchema } from "@/lib/validators/db/shared";

export async function GET(request: Request) {
  return withSession(async () => {
    try {
      const sp = new URL(request.url).searchParams;
      const search = sp.get("search") ?? undefined;
      const rawModuleId = sp.get("moduleId");
      let moduleId: string | undefined;
      if (rawModuleId?.trim()) {
        const m = uuidSchema.safeParse(rawModuleId.trim());
        if (!m.success) return badRequestFromZod(m.error);
        moduleId = m.data;
      }
      const rows = await listPermissions({ search, moduleId });
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/permissions GET]");
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
    const parsed = permissionCreateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    const d = parsed.data;
    try {
      const row = await insertPermission({
        moduleId: d.moduleId,
        code: d.code,
        label: d.label,
        description: d.description ?? null,
        sortOrder: d.sortOrder ?? 0,
      });
      return jsonOk(row, 201);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/permissions POST]");
    }
  });
}
