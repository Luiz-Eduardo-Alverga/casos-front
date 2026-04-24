import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { badRequestFromZod } from "@/lib/api-db/parse";
import { withSession } from "@/lib/api-db/with-session";
import { deleteRole, getRoleById, updateRole } from "@/lib/db/roles";
import { roleUpdateSchema } from "@/lib/validators/db/roles";
import { uuidSchema } from "@/lib/validators/db/shared";

type RouteCtx = { params: Promise<{ id: string }> };

const PROTECTED_ROLE_IDS = new Set([
  "a668ee62-30f8-482d-ac33-ca2d591a950b",
  "22917bd2-02c4-467d-a152-b7edfa757166",
]);

export async function GET(_request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    try {
      const row = await getRoleById(idParsed.data);
      if (!row) return jsonError("Papel não encontrado", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/roles/[id] GET]");
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
    const parsed = roleUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      const row = await updateRole(idParsed.data, parsed.data);
      if (!row) return jsonError("Papel não encontrado", 404);
      return jsonOk(row);
    } catch (e) {
      return handleDbRouteError(e, "[api/db/roles/[id] PATCH]");
    }
  });
}

export async function DELETE(_request: Request, context: RouteCtx) {
  return withSession(async () => {
    const { id } = await context.params;
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) return badRequestFromZod(idParsed.error);
    if (PROTECTED_ROLE_IDS.has(idParsed.data)) {
      return jsonError("Este papel é protegido e não pode ser excluído", 409);
    }
    try {
      const removed = await deleteRole(idParsed.data);
      if (!removed) return jsonError("Papel não encontrado", 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return handleDbRouteError(e, "[api/db/roles/[id] DELETE]");
    }
  });
}
