import type { UpdateProdutoModuloRequest } from "@/services/produtos/types";
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
import { validateProdutoModuloWriteBody } from "../../../_lib/validate";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; sequencia: string }> },
) {
  return withPermission("edit-product", async (session) => {
    const { id, sequencia } = await params;
    const registro = parseProdutoId(id);
    if (isErrorResponse(registro)) return registro;
    if (!sequencia) {
      return jsonError("ID do módulo é obrigatório", 400);
    }

    const parsed = await readJsonBody<UpdateProdutoModuloRequest>(request);
    if (isErrorResponse(parsed)) return parsed;

    const body: UpdateProdutoModuloRequest = {
      ...parsed,
      Registro: registro,
    };
    const validationError = validateProdutoModuloWriteBody(body);
    if (validationError) return validationError;

    return proxyLegacy("Erro ao atualizar módulo do produto", () =>
      api.put(`/projeto-versoes-modulos/${sequencia}`, body, authConfig(session)),
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
      return jsonError("ID do módulo é obrigatório", 400);
    }

    return proxyLegacy("Erro ao excluir módulo do produto", () =>
      api.delete(`/projeto-versoes-modulos/${sequencia}`, authConfig(session)),
    );
  });
}
