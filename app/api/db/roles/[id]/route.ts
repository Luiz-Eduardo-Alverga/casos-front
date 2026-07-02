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
import { deleteRole, getRoleById, updateRole } from "@/lib/db/roles";
import { roleUpdateSchema } from "@/lib/validators/db/roles";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

const PROTECTED_ROLE_IDS = new Set([
  "a668ee62-30f8-482d-ac33-ca2d591a950b",
  "22917bd2-02c4-467d-a152-b7edfa757166",
]);

export async function GET(_request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const row = await getRoleById(idParsed.data);
      if (!row) return jsonError("Papel não encontrado", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/roles/[id] GET]");
    }
  });
}

export async function PATCH(request: Request, context: RouteCtx) {
  return withPermission("assign-user-role", async (session) => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = roleUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);

    const noHierarchy = assertHasAssignableHierarchy(
      session.assignerHierarchyLevel,
    );
    if (noHierarchy) return noHierarchy;

    const assignerLevel = session.assignerHierarchyLevel!;

    try {
      const existing = await getRoleById(idParsed.data);
      if (!existing) return jsonError("Papel não encontrado", 404);

      const targetDenied = assertCanManageRoleLevel(
        assignerLevel,
        existing.hierarchyLevel,
      );
      if (targetDenied) return targetDenied;

      if (parsed.data.hierarchyLevel !== undefined) {
        const newLevelDenied = assertCanManageRoleLevel(
          assignerLevel,
          parsed.data.hierarchyLevel,
          "Você não pode definir um nível de hierarquia igual ou superior ao seu.",
        );
        if (newLevelDenied) return newLevelDenied;
      }

      const row = await updateRole(idParsed.data, parsed.data);
      if (!row) return jsonError("Papel não encontrado", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/roles/[id] PATCH]");
    }
  });
}

export async function DELETE(_request: Request, context: RouteCtx) {
  return withPermission("assign-user-role", async (session) => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    if (PROTECTED_ROLE_IDS.has(idParsed.data)) {
      return jsonError("Este papel é protegido e não pode ser excluído", 409);
    }

    const noHierarchy = assertHasAssignableHierarchy(
      session.assignerHierarchyLevel,
    );
    if (noHierarchy) return noHierarchy;

    const assignerLevel = session.assignerHierarchyLevel!;

    try {
      const existing = await getRoleById(idParsed.data);
      if (!existing) return jsonError("Papel não encontrado", 404);

      const denied = assertCanManageRoleLevel(
        assignerLevel,
        existing.hierarchyLevel,
      );
      if (denied) return denied;

      const removed = await deleteRole(idParsed.data);
      if (!removed) return jsonError("Papel não encontrado", 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/roles/[id] DELETE]");
    }
  });
}
