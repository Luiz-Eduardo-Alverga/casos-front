import {
  conflictOrNull,
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import {
  getAppUserById,
  linkUserRole,
  listRolesForAppUserId,
  userRoleLinkExists,
} from "@/lib/db/app-users";
import { getRoleById } from "@/lib/db/roles";
import { userRoleLinkSchema } from "@/lib/validators/db/user-roles";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteCtx) {
  return withPermission("list-user", async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const user = await getAppUserById(idParsed.data);
      if (!user) return jsonError("Usuário não encontrado", 404);
      const roleRows = await listRolesForAppUserId(idParsed.data);
      return jsonOk(roleRows);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/app-users/[id]/roles GET]");
    }
  });
}

export async function POST(request: Request, context: RouteCtx) {
  return withPermission("assign-user-role", async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    const userId = idParsed.data;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = userRoleLinkSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

    try {
      if (!(await getAppUserById(userId))) {
        return jsonError("Usuário não encontrado", 404);
      }
      if (!(await getRoleById(parsed.data.roleId))) {
        return jsonError("Papel não encontrado", 404);
      }
      if (await userRoleLinkExists(userId, parsed.data.roleId)) {
        return jsonError("Papel já atribuído a este usuário", 409);
      }
      const row = await linkUserRole(userId, parsed.data.roleId);
      return jsonOk(row, 201);
    } catch (e) {
      const c = conflictOrNull(e);
      if (c) return c;
      return handleDbRouteError(e, "[api/db/app-users/[id]/roles POST]");
    }
  });
}
