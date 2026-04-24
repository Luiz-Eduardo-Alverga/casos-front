import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import {
  insertRole,
  listRoles,
  listRolesWithPermissionCount,
} from "@/lib/db/roles";
import { roleCreateSchema } from "@/lib/validators/db/roles";

export async function GET(request: Request) {
  return withSession(async () => {
    try {
      const url = new URL(request.url);
      const search = url.searchParams.get("search") ?? undefined;
      const expand = url.searchParams.get("expand");
      if (expand && expand !== "permissionsCount") {
        return jsonError(
          "Parâmetro expand inválido. Use expand=permissionsCount.",
          400,
        );
      }
      const rows =
        expand === "permissionsCount"
          ? await listRolesWithPermissionCount(search)
          : await listRoles(search);
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/roles GET]");
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
    const parsed = roleCreateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    const d = parsed.data;
    try {
      const row = await insertRole({
        name: d.name,
        description: d.description ?? null,
      });
      return jsonOk(row, 201);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/roles POST]");
    }
  });
}
