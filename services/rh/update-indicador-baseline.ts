import { fetchWithAuth } from "@/lib/fetch";

export interface UpdateIndicadorBaselineRequest {
  id: number;
  indicador_id: number;
  pilha: boolean;
  suporte_id: number;
  data_inicial: string;
  data_final: string;
  pdv: string;
  setor: string;
}

export interface UpdateIndicadorBaselineData {
  id: number;
  indicador_id: number;
  valor_indicador: number;
  valor_anterior: number;
  linhas_afetadas: number;
  pilha: boolean;
}

export interface UpdateIndicadorBaselineResponse {
  success: boolean;
  data: UpdateIndicadorBaselineData;
}

/**
 * Recalcula o baseline de um indicador do colaborador.
 * Fluxo: Service → API Route → API externa POST /rh/colaboradores/indicadores/atualizar-baseline
 */
export async function updateIndicadorBaseline(
  body: UpdateIndicadorBaselineRequest,
): Promise<UpdateIndicadorBaselineResponse> {
  const url = new URL(
    "/api/rh/colaboradores/indicadores/atualizar-baseline",
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload?.message ?? payload?.error ?? "Erro ao recalcular indicador",
    );
  }

  return payload as UpdateIndicadorBaselineResponse;
}
