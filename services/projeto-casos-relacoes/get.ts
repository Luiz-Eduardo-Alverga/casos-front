import { fetchWithAuth } from "@/lib/fetch";
import type { CasoRelacaoItem } from "@/services/projeto-casos-relacoes/create";

export interface GetCasoRelacoesResponse {
  data: CasoRelacaoItem[];
}

/**
 * Lista relações de um caso por registro.
 * GET /api/projeto-casos-relacoes?registro=... → API externa GET /projeto-casos-relacoes?registro=...
 */
export async function getCasoRelacoes(params: {
  registro: number | string;
}): Promise<GetCasoRelacoesResponse> {
  const url = new URL("/api/projeto-casos-relacoes", window.location.origin);
  url.searchParams.set("registro", String(params.registro));

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao buscar relações do caso"
    );
  }

  return await response.json();
}

