import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import { getAppUserById, getAppUserByIdWithRoles } from "@/lib/db/app-users";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteCtx) {
  return withPermission("list-user", async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    const expand = new URL(request.url).searchParams.get("expand");
    try {
      if (expand === "roles") {
        const row = await getAppUserByIdWithRoles(idParsed.data);
        if (!row) return jsonError("Usuário não encontrado", 404);
        return jsonOk(row);
      }
      const row = await getAppUserById(idParsed.data);
      if (!row) return jsonError("Usuário não encontrado", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/app-users/[id] GET]");
    }
  });
}
