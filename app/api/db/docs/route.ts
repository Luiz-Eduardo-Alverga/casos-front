import { badRequestFromZod } from "@/lib/api-db/parse";
import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { withPermission } from "@/lib/api-db/with-permission";
import {
  createDoc,
  InvalidDocCursorError,
  listDocs,
} from "@/lib/db/docs";
import {
  createDocSchema,
  listDocsQuerySchema,
} from "@/lib/validators/db/doc";

export async function GET(request: Request) {
  return withPermission("list-doc", async () => {
    const parsed = listDocsQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      return jsonOk(await listDocs(parsed.data));
    } catch (error) {
      if (error instanceof InvalidDocCursorError) {
        return jsonError(error.message, 400);
      }
      return handleDbRouteError(error, "[api/db/docs GET]");
    }
  });
}

export async function POST(request: Request) {
  return withPermission("create-doc", async (session) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = createDocSchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      const doc = await createDoc(parsed.data, session.appUserId);
      return jsonOk(doc, 201);
    } catch (error) {
      return handleDbRouteError(error, "[api/db/docs POST]");
    }
  });
}
