import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withPermission } from "@/lib/api-db/with-permission";
import { listAcquirersExpanded } from "@/lib/db/acquirers-expanded";
import { insertAcquirer, listAcquirers } from "@/lib/db/acquirers";
import {
  acquirerCreateSchema,
  type AcquirerCreateInput,
} from "@/lib/validators/db/acquirers";
import { statusTypeSchema } from "@/lib/validators/db/shared";

function toInsertValues(
  input: AcquirerCreateInput,
): Parameters<typeof insertAcquirer>[0] {
  return {
    name: input.name,
    logoUrl: input.logoUrl ?? undefined,
    has4g: input.has4g ?? undefined,
  };
}

const EXPAND_STATUS = "status";

export async function GET(request: Request) {
  return withPermission("list-acquirer", async () => {
    try {
      const sp = new URL(request.url).searchParams;
      const search = sp.get("search") ?? undefined;
      const expand = sp.get("expand");
      const rawStatus = sp.get("status");
      let statusFilter: string | undefined;
      if (rawStatus != null && rawStatus.trim()) {
        const parsed = statusTypeSchema.safeParse(rawStatus.trim());
        if (!parsed.success) return badRequestFromZod(parsed.error);
        statusFilter = parsed.data;
      }
      const rows =
        expand === EXPAND_STATUS
          ? await listAcquirersExpanded(search, statusFilter)
          : await listAcquirers(search);
      return jsonOk(rows);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/acquirers GET]");
    }
  });
}

export async function POST(request: Request) {
  return withPermission("create-acquirer", async () => {
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
