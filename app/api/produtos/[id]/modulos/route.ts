import type {
  CreateProdutoModuloRequest,
  ProdutoModuloPayload,
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
import { validateCreateProdutoModuloBody } from "../../_lib/validate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("list-product", async (session) => {
    const { id } = await params;
    const registro = parseProdutoId(id);
    if (isErrorResponse(registro)) return registro;

    const url = new URL(request.url);
    return proxyLegacy("Erro ao buscar módulos do produto", () =>
      api.get("/projeto-versoes-modulos", {
        params: {
          Registro: registro,
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

    const parsed = await readJsonBody<ProdutoModuloPayload>(request);
    if (isErrorResponse(parsed)) return parsed;

    const body: CreateProdutoModuloRequest = {
      ...parsed,
      Registro: registro,
      Versionado: parsed.Versionado ?? true,
      Atualizador: parsed.Atualizador ?? false,
    };
    const validationError = validateCreateProdutoModuloBody(body);
    if (validationError) return validationError;

    return proxyLegacy("Erro ao criar módulo do produto", () =>
      api.post("/projeto-versoes-modulos", body, authConfig(session)),
    );
  });
}
