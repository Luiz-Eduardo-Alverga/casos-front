import { fetchWithAuth } from "@/lib/fetch";

export interface DeleteProdutosOrdemResponse {
  message: string;
}

export async function deleteProdutosOrdem(params: {
  id: string | number;
}): Promise<DeleteProdutosOrdemResponse> {
  const url = new URL(
    `/api/projeto-dev/produtos-ordem/${params.id}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao excluir ordem");
  }

  return await response.json();
}

