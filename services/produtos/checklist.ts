import { jsonInit, produtosFetch, withQuery } from "@/services/produtos/request";
import type {
  CreateProdutoChecklistResponse,
  DeleteProdutoChecklistResponse,
  GetProdutoChecklistParams,
  ProdutoChecklistData,
  ProdutoChecklistListResponse,
  ProdutoChecklistPayload,
  UpdateProdutoChecklistResponse,
} from "@/services/produtos/types";

export type {
  CreateProdutoChecklistResponse,
  DeleteProdutoChecklistResponse,
  GetProdutoChecklistParams,
  ProdutoChecklistData,
  ProdutoChecklistListResponse,
  ProdutoChecklistPayload,
  UpdateProdutoChecklistResponse,
} from "@/services/produtos/types";

const CHECKLIST_PAGE_SIZE = 100;
const CHECKLIST_MAX_PAGES = 50;

function produtoIdFrom(params: GetProdutoChecklistParams): number | string {
  return params.produtoId ?? params.projetoVersoesId ?? "";
}

export async function getProdutoChecklist(
  params: GetProdutoChecklistParams,
): Promise<ProdutoChecklistListResponse> {
  const produtoId = produtoIdFrom(params);
  return produtosFetch<ProdutoChecklistListResponse>(
    withQuery(
      `/api/produtos/${encodeURIComponent(String(produtoId))}/checklist`,
      {
        per_page: params.per_page,
        cursor: params.cursor,
      },
    ),
    { method: "GET" },
    "Erro ao buscar checklist do produto",
  );
}

export async function getProdutoChecklistAll(
  produtoId: number | string,
): Promise<ProdutoChecklistData[]> {
  const items: ProdutoChecklistData[] = [];
  let cursor: string | null = null;
  let pages = 0;

  do {
    const page = await getProdutoChecklist({
      produtoId,
      per_page: CHECKLIST_PAGE_SIZE,
      cursor,
    });
    items.push(...page.data);
    cursor = page.pagination.has_more ? page.pagination.next_cursor : null;
    pages += 1;
  } while (cursor && pages < CHECKLIST_MAX_PAGES);

  return items;
}

export async function createProdutoChecklist(
  produtoId: number | string,
  data: ProdutoChecklistPayload,
): Promise<CreateProdutoChecklistResponse> {
  return produtosFetch<CreateProdutoChecklistResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/checklist`,
    jsonInit("POST", data),
    "Erro ao criar item de checklist",
  );
}

export async function updateProdutoChecklist(
  produtoId: number | string,
  itemId: number | string,
  data: ProdutoChecklistPayload,
): Promise<UpdateProdutoChecklistResponse> {
  return produtosFetch<UpdateProdutoChecklistResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/checklist/${encodeURIComponent(String(itemId))}`,
    jsonInit("PUT", data),
    "Erro ao atualizar item de checklist",
  );
}

export async function deleteProdutoChecklist(
  produtoId: number | string,
  itemId: number | string,
): Promise<DeleteProdutoChecklistResponse> {
  return produtosFetch<DeleteProdutoChecklistResponse>(
    `/api/produtos/${encodeURIComponent(String(produtoId))}/checklist/${encodeURIComponent(String(itemId))}`,
    { method: "DELETE" },
    "Erro ao excluir item de checklist",
    { success: true, message: "Item de checklist excluído com sucesso" },
  );
}
