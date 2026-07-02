import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import {
  assertCanManageRoleLevel,
  assertHasAssignableHierarchy,
} from "@/lib/api-db/assert-role-hierarchy";
import { withPermission } from "@/lib/api-db/with-permission";
import { withSession } from "@/lib/api-db/with-session";
import {
  insertRole,
  listRoles,
  listRolesWithPermissionCount,
} from "@/lib/db/roles";
import { filterRolesByHierarchy } from "@/lib/rbac-hierarchy";
import { roleCreateSchema } from "@/lib/validators/db/roles";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const expand = url.searchParams.get("expand");
  const assignable = url.searchParams.get("assignable") === "true";
  const manageable = url.searchParams.get("manageable") === "true";

  if (expand && expand !== "permissionsCount") {
    return withSession(async () =>
      jsonError(
        "Parâmetro expand inválido. Use expand=permissionsCount.",
        400,
      ),
    );
  }

  if (assignable || manageable) {
    return withPermission("assign-user-role", async (session) => {
      try {
        const noHierarchy = assertHasAssignableHierarchy(
          session.assignerHierarchyLevel,
        );
        if (noHierarchy) return noHierarchy;

        const assignerLevel = session.assignerHierarchyLevel!;
        const rows =
          expand === "permissionsCount"
            ? await listRolesWithPermissionCount(search)
            : await listRoles(search);

        return jsonOk(filterRolesByHierarchy(rows, assignerLevel));
      } catch (e) {
        return handleDbRouteError(e, "[api/db/roles GET filtered]");
      }
    });
  }

  return withSession(async () => {
    try {
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
  return withPermission("assign-user-role", async (session) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = roleCreateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

    const noHierarchy = assertHasAssignableHierarchy(
      session.assignerHierarchyLevel,
    );
    if (noHierarchy) return noHierarchy;

    const assignerLevel = session.assignerHierarchyLevel!;
    const levelDenied = assertCanManageRoleLevel(
      assignerLevel,
      parsed.data.hierarchyLevel,
      "Você não pode criar um perfil com hierarquia igual ou superior à sua.",
    );
    if (levelDenied) return levelDenied;

    const d = parsed.data;
    try {
      const row = await insertRole({
        name: d.name,
        description: d.description ?? null,
        hierarchyLevel: d.hierarchyLevel,
      });
      return jsonOk(row, 201);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/roles POST]");
    }
  });
}
