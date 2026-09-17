import type {
  ProdutoScriptPayload,
  UpdateProdutoScriptRequest,
} from "@/services/produtos/types";
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
import { validateProdutoScriptWriteBody } from "../../../_lib/validate";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; scriptId: string }> },
) {
  return withPermission("edit-product", async (session) => {
    const { id, scriptId } = await params;
    const registro = parseProdutoId(id);
    if (isErrorResponse(registro)) return registro;
    if (!scriptId) {
      return jsonError("ID do script é obrigatório", 400);
    }

    const parsed = await readJsonBody<ProdutoScriptPayload>(request);
    if (isErrorResponse(parsed)) return parsed;

    const body: UpdateProdutoScriptRequest = {
      ...parsed,
      projetoVersoes_id: registro,
    };
    const validationError = validateProdutoScriptWriteBody(body);
    if (validationError) return validationError;

    return proxyLegacy("Erro ao atualizar script do produto", () =>
      api.put(`/projeto-versoes-scripts/${scriptId}`, body, authConfig(session)),
    );
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; scriptId: string }> },
) {
  return withPermission("delete-product", async (session) => {
    const { scriptId } = await params;
    if (!scriptId) {
      return jsonError("ID do script é obrigatório", 400);
    }

    return proxyLegacy("Erro ao excluir script do produto", () =>
      api.delete(`/projeto-versoes-scripts/${scriptId}`, authConfig(session)),
    );
  });
}
