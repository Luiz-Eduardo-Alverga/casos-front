import { jsonInit, produtosFetch, withQuery } from "@/services/produtos/request";
import type {
  CreateProdutoResponse,
  GetProdutosParams,
  ProdutoPayload,
  ProdutoResponse,
  ProdutosListResponse,
  UpdateProdutoResponse,
} from "@/services/produtos/types";

export type {
  CreateProdutoResponse,
  GetProdutosParams,
  ProdutoData,
  ProdutoPayload,
  ProdutoResponse,
  ProdutosListResponse,
  UpdateProdutoResponse,
} from "@/services/produtos/types";

export async function getProdutos(
  params: GetProdutosParams = {},
): Promise<ProdutosListResponse> {
  const nomeProjeto = params.NomeProjeto ?? params.nomeProjeto;
  const setor = params.Setor ?? params.setor;

  return produtosFetch<ProdutosListResponse>(
    withQuery("/api/produtos", {
      NomeProjeto: nomeProjeto,
      Setor: setor,
      per_page: params.per_page,
      cursor: params.cursor,
    }),
    { method: "GET" },
    "Erro ao buscar produtos",
  );
}

export async function getProduto(
  id: number | string,
): Promise<ProdutoResponse> {
  return produtosFetch<ProdutoResponse>(
    `/api/produtos/${encodeURIComponent(String(id))}`,
    { method: "GET" },
    "Erro ao buscar detalhes do produto",
  );
}

/** @deprecated Use getProduto */
export const getProdutoById = getProduto;

export async function createProduto(
  data: ProdutoPayload,
): Promise<CreateProdutoResponse> {
  return produtosFetch<CreateProdutoResponse>(
    "/api/produtos",
    jsonInit("POST", data),
    "Erro ao criar produto",
  );
}

export async function updateProduto(
  id: number | string,
  data: ProdutoPayload,
): Promise<UpdateProdutoResponse> {
  return produtosFetch<UpdateProdutoResponse>(
    `/api/produtos/${encodeURIComponent(String(id))}`,
    jsonInit("PUT", data),
    "Erro ao atualizar produto",
  );
}
