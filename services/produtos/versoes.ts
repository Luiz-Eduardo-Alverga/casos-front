import { jsonInit, produtosFetch, withQuery } from "@/services/produtos/request";
import type {
  CreateProdutoVersaoResponse,
  DeleteProdutoVersaoResponse,
  GetProdutoVersoesParams,
  ProdutoVersaoPayload,
  ProdutoVersoesListResponse,
  UpdateProdutoVersaoResponse,
} from "@/services/produtos/types";

export type {
  CreateProdutoVersaoResponse,
  DeleteProdutoVersaoResponse,
  GetProdutoVersoesParams,
  ProdutoVersaoData,
  ProdutoVersaoPayload,
  ProdutoVersoesListResponse,
  UpdateProdutoVersaoResponse,
} from "@/services/produtos/types";

function produtoIdFrom(params: GetProdutoVersoesParams): number | string {
  return params.produtoId ?? params.registro ?? "";
}

export async function getProdutoVersoes(
  params: GetProdutoVersoesParams,
): Promise<ProdutoVersoesListResponse> {
  const produtoId = produtoIdFrom(params);
  return produtosFetch<ProdutoVersoesListResponse>(
    withQuery(`/api/produtos/${encodeURIComponent(String(produtoId))}/versoes`, {
      per_page: params.per_page,
      cursor: params.cursor,
    }),
    { method: "GET" },
    "Erro ao buscar versões do produto",
  );
}

export async function createProdutoVersao(
  produtoId: number | string,
  data: ProdutoVersaoPayload,
): Promise<CreateProdutoVersaoResponse> {
  return produtosFetch<CreateProdutoVersaoResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/versoes`,
    jsonInit("POST", data),
    "Erro ao criar versão do produto",
  );
}

export async function updateProdutoVersao(
  produtoId: number | string,
  sequencia: number | string,
  data: ProdutoVersaoPayload,
): Promise<UpdateProdutoVersaoResponse> {
  return produtosFetch<UpdateProdutoVersaoResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/versoes/${encodeURIComponent(String(sequencia))}`,
    jsonInit("PUT", data),
    "Erro ao atualizar versão do produto",
  );
}

export async function deleteProdutoVersao(
  produtoId: number | string,
  sequencia: number | string,
): Promise<DeleteProdutoVersaoResponse> {
  return produtosFetch<DeleteProdutoVersaoResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/versoes/${encodeURIComponent(String(sequencia))}`,
    { method: "DELETE" },
    "Erro ao excluir versão do produto",
    { success: true, message: "Versão excluída com sucesso" },
  );
}
