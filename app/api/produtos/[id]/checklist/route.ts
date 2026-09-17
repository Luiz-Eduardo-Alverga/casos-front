import type {
  CreateProdutoChecklistRequest,
  ProdutoChecklistPayload,
} from "@/services/produtos/types";
import {
  api,
  authConfig,
  isErrorResponse,
  paginationParams,
  parseProdutoId,
  proxyLegacy,
  readJsonBody,
  withPermission,
} from "../../_lib/proxy";
import { validateProdutoChecklistWriteBody } from "../../_lib/validate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("list-product", async (session) => {
    const { id } = await params;
    const registro = parseProdutoId(id);
    if (isErrorResponse(registro)) return registro;

    const url = new URL(request.url);
    return proxyLegacy("Erro ao buscar checklist do produto", () =>
      api.get("/projeto-versoes-checklist", {
        params: {
          Projeto_Versoes_ID: registro,
          ...paginationParams(url),
        },
        ...authConfig(session),
      }),
    );
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("edit-product", async (session) => {
    const { id } = await params;
    const registro = parseProdutoId(id);
    if (isErrorResponse(registro)) return registro;

    const parsed = await readJsonBody<ProdutoChecklistPayload>(request);
    if (isErrorResponse(parsed)) return parsed;

    const body: CreateProdutoChecklistRequest = {
      ...parsed,
      Projeto_Versoes_ID: registro,
    };
    const validationError = validateProdutoChecklistWriteBody(body);
    if (validationError) return validationError;

    return proxyLegacy("Erro ao criar item de checklist", () =>
      api.post("/projeto-versoes-checklist", body, authConfig(session)),
    );
  });
}
