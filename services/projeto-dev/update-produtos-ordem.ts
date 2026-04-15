import { fetchWithAuth } from "@/lib/fetch";
import type { ProdutoOrdem } from "@/services/projeto-dev/get-produtos-ordem";

export interface UpdateProdutosOrdemBody {
  id_colaborador: number;
  id_produto: number;
  versao: string;
  ordem: number;
}

export interface UpdateProdutosOrdemResponse {
  message: string;
  data: ProdutoOrdem;
}

export async function updateProdutosOrdem(params: {
  id: string | number;
  body: UpdateProdutosOrdemBody;
}): Promise<UpdateProdutosOrdemResponse> {
  const url = new URL(
    `/api/projeto-dev/produtos-ordem/${params.id}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao alterar ordem");
  }

  return await response.json();
}

