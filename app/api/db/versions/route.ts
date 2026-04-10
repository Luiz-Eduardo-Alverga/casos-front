import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import { insertVersion, listVersions } from "@/lib/db/versions";
import { versionCreateSchema } from "@/lib/validators/db/versions";

export async function GET(request: Request) {
  return withSession(async () => {
    try {
      const search = new URL(request.url).searchParams.get("search") ?? undefined;
      const rows = await listVersions(search);
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/versions GET]");
    }
  });
}

export async function POST(request: Request) {
  return withSession(async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = versionCreateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      const row = await insertVersion({
        name: parsed.data.name ?? undefined,
      });
      return jsonOk(row, 201);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/versions POST]");
    }
  });
}
