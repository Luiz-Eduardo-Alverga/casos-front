import {
  handleDbRouteError,
  jsonError,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { assertCanManageRoleById } from "@/lib/api-db/assert-role-hierarchy";
import { withPermission } from "@/lib/api-db/with-permission";
import { unlinkRolePermission } from "@/lib/db/role-permissions";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = {
  params: Promise<{ id: string; permissionId: string }>;
};

export async function DELETE(_request: Request, context: RouteCtx) {
  return withPermission("assign-user-role", async (session) => {
    const { id, permissionId } = await context.params;
    const roleIdParsed = uuidSchema.safeParse(id);
    if (!roleIdParsed.success) return badRequestFromZod(roleIdParsed.error);
    const permParsed = uuidSchema.safeParse(permissionId);
    if (!permParsed.success) return badRequestFromZod(permParsed.error);

    try {
      const hierarchyDenied = await assertCanManageRoleById(
        session.assignerHierarchyLevel,
        roleIdParsed.data,
      );
      if (hierarchyDenied) return hierarchyDenied;

      const removed = await unlinkRolePermission(
        roleIdParsed.data,
        permParsed.data,
      );
      if (!removed) return jsonError("Vínculo não encontrado", 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/roles/[id]/permissions/[permissionId] DELETE]",
      );
    }
  });
}
