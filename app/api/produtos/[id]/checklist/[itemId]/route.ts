import type {
  ProdutoChecklistPayload,
  UpdateProdutoChecklistRequest,
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
import { validateProdutoChecklistWriteBody } from "../../../_lib/validate";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  return withPermission("edit-product", async (session) => {
    const { id, itemId } = await params;
    const registro = parseProdutoId(id);
    if (isErrorResponse(registro)) return registro;
    if (!itemId) {
      return jsonError("ID do item de checklist é obrigatório", 400);
    }

    const parsed = await readJsonBody<ProdutoChecklistPayload>(request);
    if (isErrorResponse(parsed)) return parsed;

    const body: UpdateProdutoChecklistRequest = {
      ...parsed,
      Projeto_Versoes_ID: registro,
    };
    const validationError = validateProdutoChecklistWriteBody(body);
    if (validationError) return validationError;

    return proxyLegacy("Erro ao atualizar item de checklist", () =>
      api.put(`/projeto-versoes-checklist/${itemId}`, body, authConfig(session)),
    );
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  return withPermission("delete-product", async (session) => {
    const { itemId } = await params;
    if (!itemId) {
      return jsonError("ID do item de checklist é obrigatório", 400);
    }

    return proxyLegacy("Erro ao excluir item de checklist", () =>
      api.delete(`/projeto-versoes-checklist/${itemId}`, authConfig(session)),
    );
  });
}
