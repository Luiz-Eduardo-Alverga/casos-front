import { fetchWithAuth } from "@/lib/fetch";
import type { ProdutoOrdem } from "@/services/projeto-dev/get-produtos-ordem";

export interface CreateProdutosOrdemBody {
  id_colaborador: number;
  id_produto: number;
  versao: string;
  ordem: number;
}

export interface CreateProdutosOrdemResponse {
  message: string;
  data: ProdutoOrdem;
}

export async function createProdutosOrdem(
  body: CreateProdutosOrdemBody
): Promise<CreateProdutosOrdemResponse> {
  const url = new URL("/api/projeto-dev/produtos-ordem", window.location.origin);

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao criar ordem");
  }

  return await response.json();
}

