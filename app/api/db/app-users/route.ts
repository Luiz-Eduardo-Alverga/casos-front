import { handleDbRouteError, jsonOk } from "@/lib/api-db/responses";
import { assertHasAssignableHierarchy } from "@/lib/api-db/assert-role-hierarchy";
import { withPermission } from "@/lib/api-db/with-permission";
import { listAppUsersPage } from "@/lib/db/app-users";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const cursorRaw = url.searchParams.get("cursor");
  const limitRaw = url.searchParams.get("limit");
  const manageable = url.searchParams.get("manageable") === "true";

  const cursor = cursorRaw != null ? Number(cursorRaw) : undefined;
  const limit = limitRaw != null ? Number(limitRaw) : 20;

  if (manageable) {
    return withPermission("assign-user-role", async (session) => {
      try {
        const noHierarchy = assertHasAssignableHierarchy(
          session.assignerHierarchyLevel,
        );
        if (noHierarchy) return noHierarchy;

        const page = await listAppUsersPage({
          search,
          limit,
          cursor,
          manageableBy: {
            assignerUserId: session.appUserId,
            assignerLevel: session.assignerHierarchyLevel!,
          },
        });
        return jsonOk(page);
      } catch (e) {
        return handleDbRouteError(e, "[api/db/app-users GET manageable]");
      }
    });
  }

  return withPermission("list-user", async () => {
    try {
      const page = await listAppUsersPage({ search, limit, cursor });
      return jsonOk(page);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/app-users GET]");
    }
  });
}
