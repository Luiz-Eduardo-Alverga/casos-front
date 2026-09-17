import { jsonInit, produtosFetch, withQuery } from "@/services/produtos/request";
import type {
  CreateProdutoModuloResponse,
  DeleteProdutoModuloResponse,
  GetProdutoModulosParams,
  ProdutoModuloPayload,
  ProdutoModulosListResponse,
  UpdateProdutoModuloResponse,
} from "@/services/produtos/types";

export type {
  CreateProdutoModuloResponse,
  DeleteProdutoModuloResponse,
  GetProdutoModulosParams,
  ProdutoModuloData,
  ProdutoModuloPayload,
  ProdutoModulosListResponse,
  UpdateProdutoModuloResponse,
} from "@/services/produtos/types";

function produtoIdFrom(params: GetProdutoModulosParams): number | string {
  return params.produtoId ?? params.registro ?? "";
}

export async function getProdutoModulos(
  params: GetProdutoModulosParams,
): Promise<ProdutoModulosListResponse> {
  const produtoId = produtoIdFrom(params);
  return produtosFetch<ProdutoModulosListResponse>(
    withQuery(`/api/produtos/${encodeURIComponent(String(produtoId))}/modulos`, {
      per_page: params.per_page,
      cursor: params.cursor,
    }),
    { method: "GET" },
    "Erro ao buscar módulos do produto",
  );
}

export async function createProdutoModulo(
  produtoId: number | string,
  data: ProdutoModuloPayload,
): Promise<CreateProdutoModuloResponse> {
  return produtosFetch<CreateProdutoModuloResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/modulos`,
    jsonInit("POST", data),
    "Erro ao criar módulo do produto",
  );
}

export async function updateProdutoModulo(
  produtoId: number | string,
  sequencia: number | string,
  data: ProdutoModuloPayload,
): Promise<UpdateProdutoModuloResponse> {
  return produtosFetch<UpdateProdutoModuloResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/modulos/${encodeURIComponent(String(sequencia))}`,
    jsonInit("PUT", data),
    "Erro ao atualizar módulo do produto",
  );
}

export async function deleteProdutoModulo(
  produtoId: number | string,
  sequencia: number | string,
): Promise<DeleteProdutoModuloResponse> {
  return produtosFetch<DeleteProdutoModuloResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/modulos/${encodeURIComponent(String(sequencia))}`,
    { method: "DELETE" },
    "Erro ao excluir módulo do produto",
    { success: true, message: "Módulo excluído com sucesso" },
  );
}
