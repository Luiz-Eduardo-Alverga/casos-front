import {
  conflictOrNull,
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import {
  linkRolePermission,
  linkRolePermissionsBatch,
  listRolePermissionsWithDetails,
  permissionExists,
  roleExists,
  rolePermissionLinkExists,
  syncRolePermissions,
  MissingPermissionIdsError,
} from "@/lib/db/role-permissions";
import {
  rolePermissionLinkSchema,
  rolePermissionSyncSchema,
} from "@/lib/validators/db/role-permissions";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      if (!(await roleExists(idParsed.data))) {
        return jsonError("Papel não encontrado", 404);
      }
      const rows = await listRolePermissionsWithDetails(idParsed.data);
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/roles/[id]/permissions GET]");
    }
  });
}

export async function POST(request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    const roleId = idParsed.data;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = rolePermissionLinkSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

    try {
      if (!(await roleExists(roleId))) {
        return jsonError("Papel não encontrado", 404);
      }

      if (parsed.data.permissionId !== undefined) {
        if (!(await permissionExists(parsed.data.permissionId))) {
          return jsonError("Permissão não encontrada", 404);
        }
        if (await rolePermissionLinkExists(roleId, parsed.data.permissionId)) {
          return jsonError("Permissão já vinculada a este papel", 409);
        }
        const row = await linkRolePermission(roleId, parsed.data.permissionId);
        return jsonOk(row, 201);
      }

      const { created, skippedPermissionIds } = await linkRolePermissionsBatch(
        roleId,
        parsed.data.permissionIds!,
      );
      return jsonOk(
        { items: created, skippedPermissionIds },
        created.length > 0 ? 201 : 200,
      );
    } catch (e) {
      if (e instanceof MissingPermissionIdsError) {
        return jsonError("Uma ou mais permissões não foram encontradas", 404);
      }
      const c = conflictOrNull(e);
      if (c) return c;
      return handleDbRouteError(e, "[api/db/roles/[id]/permissions POST]");
    }
  });
}

export async function PUT(request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    const roleId = idParsed.data;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = rolePermissionSyncSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

    try {
      if (!(await roleExists(roleId))) {
        return jsonError("Papel não encontrado", 404);
      }
      const result = await syncRolePermissions(roleId, parsed.data.permissionIds);
      return jsonOk(result);
    } catch (e) {
      if (e instanceof MissingPermissionIdsError) {
        return jsonError("Uma ou mais permissões não foram encontradas", 404);
      }
      const c = conflictOrNull(e);
      if (c) return c;
      return handleDbRouteError(e, "[api/db/roles/[id]/permissions PUT]");
    }
  });
}
