import { fetchWithAuth } from "@/lib/fetch";

export interface IndicadorDetalhe {
  registro: number;
  nomes: string;
  unidade: string;
  criterio_tendencia: string;
  periodicidade: string;
  objetivo: string;
  elementos_da_cultura: string;
  partes_interessadas: string | null;
  formula_metodo: string;
  observacao: string;
  tipo_indicador: string;
}

export interface IndicadorDetalheResponse {
  success: boolean;
  data: IndicadorDetalhe;
}

/**
 * Busca o detalhe de um indicador.
 * Fluxo: Service → API Route → API externa GET /rh/auxiliar/indicadores/{id}
 */
export async function getIndicadorDetalhe(
  id: number | string,
): Promise<IndicadorDetalheResponse> {
  const indicadorId = String(id).trim();
  const url = new URL(
    `/api/rh/auxiliar/indicadores/${encodeURIComponent(indicadorId)}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body?.message ?? body?.error ?? "Erro ao buscar detalhe do indicador",
    );
  }

  return body as IndicadorDetalheResponse;
}
