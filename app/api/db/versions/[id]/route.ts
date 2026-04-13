import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import {
  deleteVersion,
  getVersionById,
  updateVersion,
} from "@/lib/db/versions";
import { versionUpdateSchema } from "@/lib/validators/db/versions";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const row = await getVersionById(idParsed.data);
      if (!row) return jsonError("Versão não encontrada", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/versions/[id] GET]");
    }
  });
}

export async function PATCH(request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = versionUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      const v = parsed.data;
      const row = await updateVersion(idParsed.data, {
        ...(v.name !== undefined ? { name: v.name ?? undefined } : {}),
      });
      if (!row) return jsonError("Versão não encontrada", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/versions/[id] PATCH]");
    }
  });
}

export async function DELETE(_request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const removed = await deleteVersion(idParsed.data);
      if (!removed) return jsonError("Versão não encontrada", 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/versions/[id] DELETE]");
    }
  });
}
