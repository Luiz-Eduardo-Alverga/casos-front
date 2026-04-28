import { handleDbRouteError, jsonOk } from "@/lib/api-db/responses";
import { withPermission } from "@/lib/api-db/with-permission";
import { listAppUsersPage } from "@/lib/db/app-users";

export async function GET(request: Request) {
  return withPermission("list-user", async () => {
    try {
      const url = new URL(request.url);
      const search = url.searchParams.get("search") ?? undefined;
      const cursorRaw = url.searchParams.get("cursor");
      const limitRaw = url.searchParams.get("limit");

      const cursor = cursorRaw != null ? Number(cursorRaw) : undefined;
      const limit = limitRaw != null ? Number(limitRaw) : 20;

      const page = await listAppUsersPage({ search, limit, cursor });
      return jsonOk(page);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/app-users GET]");
    }
  });
}
