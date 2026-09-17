import type {
  CreateProdutoScriptRequest,
  ProdutoScriptPayload,
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
import { validateProdutoScriptWriteBody } from "../../_lib/validate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("list-product", async (session) => {
    const { id } = await params;
    const registro = parseProdutoId(id);
    if (isErrorResponse(registro)) return registro;

    const url = new URL(request.url);
    return proxyLegacy("Erro ao buscar scripts do produto", () =>
      api.get("/projeto-versoes-scripts", {
        params: {
          projetoVersoes_id: registro,
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

    const parsed = await readJsonBody<ProdutoScriptPayload>(request);
    if (isErrorResponse(parsed)) return parsed;

    const body: CreateProdutoScriptRequest = {
      ...parsed,
      projetoVersoes_id: registro,
    };
    const validationError = validateProdutoScriptWriteBody(body);
    if (validationError) return validationError;

    return proxyLegacy("Erro ao criar script do produto", () =>
      api.post("/projeto-versoes-scripts", body, authConfig(session)),
    );
  });
}
