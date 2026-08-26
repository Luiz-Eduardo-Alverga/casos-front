import { badRequestFromZod } from "@/lib/api-db/parse";
import {
  handleDbRouteError,
  jsonError,
  jsonOk,
} from "@/lib/api-db/responses";
import { withPermission } from "@/lib/api-db/with-permission";
import {
  createDocCategory,
  listDocCategories,
} from "@/lib/db/docs";
import { createDocCategorySchema } from "@/lib/validators/db/doc";

export async function GET() {
  return withPermission("list-doc", async () => {
    try {
      return jsonOk(await listDocCategories());
    } catch (error) {
      return handleDbRouteError(
        error,
        "[api/db/doc-categories GET]",
      );
    }
  });
}

export async function POST(request: Request) {
  return withPermission("manage-doc-category", async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição JSON inválido", 400);
    }
    const parsed = createDocCategorySchema.safeParse(body);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    try {
      return jsonOk(await createDocCategory(parsed.data), 201);
    } catch (error) {
      return handleDbRouteError(
        error,
        "[api/db/doc-categories POST]",
      );
    }
  });
}
