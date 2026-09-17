import type { CreateProdutoRequest, ProdutoPayload } from "@/services/produtos/types";
import {
  api,
  authConfig,
  isErrorResponse,
  jsonError,
  nowIso,
  paginationParams,
  proxyLegacy,
  readJsonBody,
  withPermission,
} from "./_lib/proxy";
import { validateProdutoWriteBody } from "./_lib/validate";

export async function GET(request: Request) {
  return withPermission("list-product", async (session) => {
    const url = new URL(request.url);
    const nomeProjeto =
      url.searchParams.get("NomeProjeto") ??
      url.searchParams.get("nomeProjeto") ??
      undefined;
    const setor =
      url.searchParams.get("Setor") ??
      url.searchParams.get("setor") ??
      undefined;

    return proxyLegacy("Erro ao buscar produtos", () =>
      api.get("/projeto-versoes", {
        params: {
          ...(nomeProjeto ? { NomeProjeto: nomeProjeto } : {}),
          ...(setor ? { Setor: setor } : {}),
          ...paginationParams(url),
        },
        ...authConfig(session),
      }),
    );
  });
}

export async function POST(request: Request) {
  return withPermission("create-product", async (session) => {
    const parsed = await readJsonBody<ProdutoPayload>(request);
    if (isErrorResponse(parsed)) return parsed;

    const body: CreateProdutoRequest = {
      ...parsed,
      DataProjeto: parsed.DataProjeto?.trim() ? parsed.DataProjeto : nowIso(),
    };
    const validationError = validateProdutoWriteBody(body);
    if (validationError) return validationError;

    return proxyLegacy("Erro ao criar produto", () =>
      api.post("/projeto-versoes", body, authConfig(session)),
    );
  });
}
