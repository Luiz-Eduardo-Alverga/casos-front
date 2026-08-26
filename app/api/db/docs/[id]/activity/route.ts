import { badRequestFromZod } from "@/lib/api-db/parse";
import { handleDbRouteError, jsonOk } from "@/lib/api-db/responses";
import { withPermission } from "@/lib/api-db/with-permission";
import { listDocActivity } from "@/lib/db/docs";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteCtx) {
  return withPermission("list-doc", async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      return jsonOk(await listDocActivity(idParsed.data));
    } catch (error) {
      return handleDbRouteError(
        error,
        "[api/db/docs/[id]/activity GET]",
      );
    }
  });
}
