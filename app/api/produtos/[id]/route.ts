import type { UpdateProdutoRequest } from "@/services/produtos/types";
import {
  api,
  authConfig,
  isErrorResponse,
  parseProdutoId,
  proxyLegacy,
  readJsonBody,
  withPermission,
} from "../_lib/proxy";
import { validateProdutoWriteBody } from "../_lib/validate";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("list-product", async (session) => {
    const { id } = await params;
    const registro = parseProdutoId(id);
    if (isErrorResponse(registro)) return registro;

    return proxyLegacy("Erro ao buscar detalhes do produto", () =>
      api.get(`/projeto-versoes/${registro}`, authConfig(session)),
    );
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("edit-product", async (session) => {
    const { id } = await params;
    const registro = parseProdutoId(id);
    if (isErrorResponse(registro)) return registro;

    const body = await readJsonBody<UpdateProdutoRequest>(request);
    if (isErrorResponse(body)) return body;

    const validationError = validateProdutoWriteBody(body);
    if (validationError) return validationError;

    return proxyLegacy("Erro ao atualizar produto", () =>
      api.put(`/projeto-versoes/${registro}`, body, authConfig(session)),
    );
  });
}
