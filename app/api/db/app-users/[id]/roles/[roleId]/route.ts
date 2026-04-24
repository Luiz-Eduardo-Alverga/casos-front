import {
  handleDbRouteError,
  jsonError,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import { unlinkUserRole } from "@/lib/db/app-users";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string; roleId: string }> };

export async function DELETE(_request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id, roleId } = await context.params;
    const userParsed = uuidSchema.safeParse(id);
    if (!userParsed.success) return badRequestFromZod(userParsed.error);
    const roleParsed = uuidSchema.safeParse(roleId);
    if (!roleParsed.success) return badRequestFromZod(roleParsed.error);

    try {
      const removed = await unlinkUserRole(userParsed.data, roleParsed.data);
      if (!removed) return jsonError("Vínculo não encontrado", 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return handleDbRouteError(
        e,
        "[api/db/app-users/[id]/roles/[roleId] DELETE]",
      );
    }
  });
}
