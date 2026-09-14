import { fetchWithAuth } from "@/lib/fetch";

export type ColaboradorIndicadorAcumulado = "MAIOR" | "MENOR";
export type ColaboradorIndicadorLed = "Up" | "Down";

export interface ColaboradorIndicador {
  id: number;
  indicador_id: number;
  nomes: string;
  unidade: string;
  acumulado: ColaboradorIndicadorAcumulado | string;
  meta_indicador: number;
  saldo: number;
  resta: number;
  alcancado: boolean;
  id_led: ColaboradorIndicadorLed | string;
  peso: number;
  tipo_indicador: string;
  indicador_tipo: string;
  elementos_da_cultura: string;
  indicador_kpi: boolean;
  indicador_opi: boolean;
  indicador_driver: boolean;
  indicador_outcome: boolean;
  perc_alc: number;
  data_inicial: string;
  data_final: string;
  pdv: string;
  setor: string;
  suporte_id: number;
  indice_cultura: number;
  tem_detalhe: boolean;
}

export interface ColaboradoresIndicadoresResponse {
  success: boolean;
  data: ColaboradorIndicador[];
  total: number;
}

export interface GetColaboradoresIndicadoresParams {
  suporte_id: string;
  data_inicial: string;
  data_final: string;
}

/**
 * Busca os indicadores do colaborador.
 * Fluxo: Service → API Route → API externa GET /rh/colaboradores/indicadores
 */
export async function getColaboradoresIndicadores(
  params: GetColaboradoresIndicadoresParams,
): Promise<ColaboradoresIndicadoresResponse> {
  const url = new URL(
    "/api/rh/colaboradores/indicadores",
    window.location.origin,
  );

  url.searchParams.set("suporte_id", params.suporte_id.trim());
  url.searchParams.set("data_inicial", params.data_inicial.trim());
  url.searchParams.set("data_final", params.data_final.trim());

  const response = await fetchWithAuth(url.toString(), { method: "GET" });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body?.message ??
        body?.error ??
        "Erro ao buscar indicadores de colaboradores",
    );
  }

  return body as ColaboradoresIndicadoresResponse;
}
