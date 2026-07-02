import {
  conflictOrNull,
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import {
  assertCanGrantPermissionCodes,
  assertCanManageRoleById,
} from "@/lib/api-db/assert-role-hierarchy";
import { withPermission } from "@/lib/api-db/with-permission";
import { withSession } from "@/lib/api-db/with-session";
import { getPermissionCodesByIds } from "@/lib/db/permissions";
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
  return withPermission("assign-user-role", async (session) => {
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
      const hierarchyDenied = await assertCanManageRoleById(
        session.assignerHierarchyLevel,
        roleId,
      );
      if (hierarchyDenied) return hierarchyDenied;

      const permissionIds =
        parsed.data.permissionId !== undefined
          ? [parsed.data.permissionId]
          : parsed.data.permissionIds!;

      const codes = await getPermissionCodesByIds(permissionIds);
      const grantDenied = assertCanGrantPermissionCodes(
        session.permissions,
        codes,
        session.assignerHierarchyLevel ?? undefined,
      );
      if (grantDenied) return grantDenied;

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
  return withPermission("assign-user-role", async (session) => {
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
      const hierarchyDenied = await assertCanManageRoleById(
        session.assignerHierarchyLevel,
        roleId,
      );
      if (hierarchyDenied) return hierarchyDenied;

      const codes = await getPermissionCodesByIds(parsed.data.permissionIds);
      const grantDenied = assertCanGrantPermissionCodes(
        session.permissions,
        codes,
        session.assignerHierarchyLevel ?? undefined,
      );
      if (grantDenied) return grantDenied;

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
