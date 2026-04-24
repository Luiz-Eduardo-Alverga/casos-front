import { handleDbRouteError, jsonOk } from "@/lib/api-db/responses";
import { withPermission } from "@/lib/api-db/with-permission";
import { listAppUsers } from "@/lib/db/app-users";

export async function GET(request: Request) {
  return withPermission("list-user", async () => {
    try {
      const search =
        new URL(request.url).searchParams.get("search") ?? undefined;
      const rows = await listAppUsers(search);
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/app-users GET]");
    }
  });
}
