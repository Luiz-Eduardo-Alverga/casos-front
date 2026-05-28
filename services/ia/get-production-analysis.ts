import { apiAssistant } from "@/lib/axios";

export interface ProductionAnalysisStatusCount {
  count: number;
  percentual: number;
}

export interface ProductionAnalysisResumoSquad {
  total_colaboradores: number;
  conforme: ProductionAnalysisStatusCount;
  alerta_leve: ProductionAnalysisStatusCount;
  alerta_critico: ProductionAnalysisStatusCount;
  inconsistencia: ProductionAnalysisStatusCount;
}

export interface ProductionAnalysisColaborador {
  nome_suporte: string;
  data_producao: string;
  status: string;
  motivo_status: string;
  total_horas: string;
  janela_trabalho: string;
  horas_tecnicas: string;
  horas_nao_tecnicas: string;
  percentual_tecnico: number;
  percentual_nao_tecnico: number;
  inconsistencias: string[];
}

export interface ProductionAnalysisData {
  resumo_squad: ProductionAnalysisResumoSquad;
  colaboradores: ProductionAnalysisColaborador[];
}

export interface ProductionAnalysisResponse {
  success: boolean;
  data: ProductionAnalysisData;
  processedIn?: string;
}

export interface ProductionAnalysisParams {
  data_producao_inicio: string;
  data_producao_fim: string;
  janela_inicio?: string;
  fim?: string;
  usuario: string | number;
  projeto_id?: string | number;
}

export async function getProductionAnalysis(
  params: ProductionAnalysisParams,
): Promise<ProductionAnalysisResponse> {
  try {
    const response = await apiAssistant.get<ProductionAnalysisResponse>(
      "/api/production-analysis",
      {
        params: {
          data_producao_inicio: params.data_producao_inicio,
          data_producao_fim: params.data_producao_fim,
          ...(params.janela_inicio ? { janela_inicio: params.janela_inicio } : {}),
          ...(params.fim ? { fim: params.fim } : {}),
          usuario: params.usuario,
          ...(params.projeto_id != null && String(params.projeto_id).trim()
            ? { projeto_id: params.projeto_id }
            : {}),
        },
      },
    );

    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
    };

    const status = err?.response?.status;
    const apiMessage =
      err?.response?.data?.message || err?.response?.data?.error;
    const message =
      apiMessage ||
      (status
        ? `Erro ao buscar análise de produção (HTTP ${status})`
        : "Erro ao buscar análise de produção");

    console.error("Production analysis failed:", error);
    throw new Error(message);
  }
}
