import { jsonInit, produtosFetch, withQuery } from "@/services/produtos/request";
import type {
  CreateProdutoScriptResponse,
  DeleteProdutoScriptResponse,
  GetProdutoScriptsParams,
  ProdutoScriptPayload,
  ProdutoScriptsListResponse,
  UpdateProdutoScriptResponse,
} from "@/services/produtos/types";

export type {
  CreateProdutoScriptResponse,
  DeleteProdutoScriptResponse,
  GetProdutoScriptsParams,
  ProdutoScriptData,
  ProdutoScriptPayload,
  ProdutoScriptsListResponse,
  UpdateProdutoScriptResponse,
} from "@/services/produtos/types";

function produtoIdFrom(params: GetProdutoScriptsParams): number | string {
  return params.produtoId ?? params.projetoVersoesId ?? "";
}

export async function getProdutoScripts(
  params: GetProdutoScriptsParams,
): Promise<ProdutoScriptsListResponse> {
  const produtoId = produtoIdFrom(params);
  return produtosFetch<ProdutoScriptsListResponse>(
    withQuery(`/api/produtos/${encodeURIComponent(String(produtoId))}/scripts`, {
      per_page: params.per_page,
      cursor: params.cursor,
    }),
    { method: "GET" },
    "Erro ao buscar scripts do produto",
  );
}

export async function createProdutoScript(
  produtoId: number | string,
  data: ProdutoScriptPayload,
): Promise<CreateProdutoScriptResponse> {
  return produtosFetch<CreateProdutoScriptResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/scripts`,
    jsonInit("POST", data),
    "Erro ao criar script do produto",
  );
}

export async function updateProdutoScript(
  produtoId: number | string,
  scriptId: number | string,
  data: ProdutoScriptPayload,
): Promise<UpdateProdutoScriptResponse> {
  return produtosFetch<UpdateProdutoScriptResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/scripts/${encodeURIComponent(String(scriptId))}`,
    jsonInit("PUT", data),
    "Erro ao atualizar script do produto",
  );
}

export async function deleteProdutoScript(
  produtoId: number | string,
  scriptId: number | string,
): Promise<DeleteProdutoScriptResponse> {
  return produtosFetch<DeleteProdutoScriptResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/scripts/${encodeURIComponent(String(scriptId))}`,
    { method: "DELETE" },
    "Erro ao excluir script do produto",
    { success: true, message: "Script excluído com sucesso" },
  );
}
