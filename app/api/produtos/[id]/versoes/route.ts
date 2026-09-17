import type {
  CreateProdutoVersaoRequest,
  ProdutoVersaoPayload,
} from "@/services/produtos/types";
import {
  api,
  authConfig,
  isErrorResponse,
  nowIso,
  paginationParams,
  parseProdutoId,
  proxyLegacy,
  readJsonBody,
  withPermission,
} from "../../_lib/proxy";
import { validateProdutoVersaoWriteBody } from "../../_lib/validate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("list-product", async (session) => {
    const { id } = await params;
    const registro = parseProdutoId(id);
    if (isErrorResponse(registro)) return registro;

    const url = new URL(request.url);
    return proxyLegacy("Erro ao buscar versões do produto", () =>
      api.get("/projeto-versoes-sub", {
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

    const parsed = await readJsonBody<ProdutoVersaoPayload>(request);
    if (isErrorResponse(parsed)) return parsed;

    const body: CreateProdutoVersaoRequest = {
      ...parsed,
      Registro: registro,
      DataVersao: parsed.DataVersao?.trim() ? parsed.DataVersao : nowIso(),
      Release: parsed.Release ?? 1,
      MostrarPlanejamento: parsed.MostrarPlanejamento ?? true,
    };
    const validationError = validateProdutoVersaoWriteBody(body);
    if (validationError) return validationError;

    return proxyLegacy("Erro ao criar versão do produto", () =>
      api.post("/projeto-versoes-sub", body, authConfig(session)),
    );
  });
}
