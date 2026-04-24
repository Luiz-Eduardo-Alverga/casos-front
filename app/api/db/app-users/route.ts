import { handleDbRouteError, jsonOk } from "@/lib/api-db/responses";
import { withSession } from "@/lib/api-db/with-session";
import { listAppUsers } from "@/lib/db/app-users";

export async function GET(request: Request) {
  return withSession(async () => {
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
