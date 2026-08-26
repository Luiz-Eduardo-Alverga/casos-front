import { badRequestFromZod } from "@/lib/api-db/parse";
import { handleDbRouteError, jsonOk } from "@/lib/api-db/responses";
import { withPermission } from "@/lib/api-db/with-permission";
import { searchDocTags } from "@/lib/db/docs";
import { searchDocTagsQuerySchema } from "@/lib/validators/db/doc";

export async function GET(request: Request) {
  return withPermission("list-doc", async () => {
    const search =
      new URL(request.url).searchParams.get("search") ?? undefined;
    const parsed = searchDocTagsQuerySchema.safeParse({ search });
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      return jsonOk(await searchDocTags(parsed.data.search));
    } catch (error) {
      return handleDbRouteError(error, "[api/db/doc-tags GET]");
    }
  });
}
