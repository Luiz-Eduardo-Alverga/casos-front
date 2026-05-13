import { fetchWithAuth } from "@/lib/fetch";

export interface CasoHistoricoItem {
  seq: number;
  registro: number;
  data_alteracao: string;
  usuario: string;
  historico: string;
}

export interface GetCasoHistoricoResponse {
  data: CasoHistoricoItem[];
  total: number;
}

/**
 * Histórico de alterações de um caso (registro).
 * GET /api/projeto-casos/historico/{registro} → API externa GET /projeto-casos/historico/{registro}
 */
export async function getCasoHistorico(params: {
  registro: number | string;
}): Promise<GetCasoHistoricoResponse> {
  const url = new URL(
    `/api/projeto-casos/historico/${encodeURIComponent(String(params.registro))}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao buscar histórico do caso"
    );
  }

  return await response.json();
}
