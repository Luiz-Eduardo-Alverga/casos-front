import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import { insertAcquirer, listAcquirers } from "@/lib/db/acquirers";
import {
  acquirerCreateSchema,
  type AcquirerCreateInput,
} from "@/lib/validators/db/acquirers";

function toInsertValues(
  input: AcquirerCreateInput,
): Parameters<typeof insertAcquirer>[0] {
  return {
    name: input.name,
    logoUrl: input.logoUrl ?? undefined,
    has4g: input.has4g ?? undefined,
  };
}

export async function GET(request: Request) {
  return withSession(async () => {
    try {
      const search = new URL(request.url).searchParams.get("search") ?? undefined;
      const rows = await listAcquirers(search);
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/acquirers GET]");
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
    const parsed = acquirerCreateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      const row = await insertAcquirer(toInsertValues(parsed.data));
      return jsonOk(row, 201);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/acquirers POST]");
    }
  });
}
