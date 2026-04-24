import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import {
  insertPermissionModule,
  listPermissionModules,
  listPermissionModulesWithPermissions,
} from "@/lib/db/permission-modules";
import { permissionModuleCreateSchema } from "@/lib/validators/db/permission-modules";

export async function GET(request: Request) {
  return withSession(async () => {
    try {
      const sp = new URL(request.url).searchParams;
      const search = sp.get("search") ?? undefined;
      const expand = sp.get("expand");
      if (expand === "permissions") {
        const rows = await listPermissionModulesWithPermissions(search);
        return jsonOk(rows);
      }
      const rows = await listPermissionModules(search);
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/permission-modules GET]");
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
    const parsed = permissionModuleCreateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    const d = parsed.data;
    try {
      const row = await insertPermissionModule({
        slug: d.slug,
        name: d.name,
        description: d.description ?? null,
        sortOrder: d.sortOrder ?? 0,
      });
      return jsonOk(row, 201);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/permission-modules POST]");
    }
  });
}
