import type { UpdateProdutoVersaoRequest } from "@/services/produtos/types";
import {
  api,
  authConfig,
  isErrorResponse,
  jsonError,
  parseProdutoId,
  proxyLegacy,
  readJsonBody,
  withPermission,
} from "../../../_lib/proxy";
import { validateProdutoVersaoWriteBody } from "../../../_lib/validate";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; sequencia: string }> },
) {
  return withPermission("edit-product", async (session) => {
    const { id, sequencia } = await params;
    const registro = parseProdutoId(id);
    if (isErrorResponse(registro)) return registro;
    if (!sequencia) {
      return jsonError("ID da versão é obrigatório", 400);
    }

    const parsed = await readJsonBody<UpdateProdutoVersaoRequest>(request);
    if (isErrorResponse(parsed)) return parsed;

    const body: UpdateProdutoVersaoRequest = {
      ...parsed,
      Registro: registro,
    };
    const validationError = validateProdutoVersaoWriteBody(body);
    if (validationError) return validationError;

    return proxyLegacy("Erro ao atualizar versão do produto", () =>
      api.patch(`/projeto-versoes-sub/${sequencia}`, body, authConfig(session)),
    );
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; sequencia: string }> },
) {
  return withPermission("delete-product", async (session) => {
    const { sequencia } = await params;
    if (!sequencia) {
      return jsonError("ID da versão é obrigatório", 400);
    }

    return proxyLegacy("Erro ao excluir versão do produto", () =>
      api.delete(`/projeto-versoes-sub/${sequencia}`, authConfig(session)),
    );
  });
}
