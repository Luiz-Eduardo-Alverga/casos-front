"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getProductionAnalysis,
  type ProductionAnalysisColaborador,
  type ProductionAnalysisData,
  type ProductionAnalysisParams,
  type ProductionAnalysisResponse,
  type ProductionAnalysisResumoSquad,
} from "@/services/ia/get-production-analysis";

export interface UseProductionAnalysisOptions {
  enabled?: boolean;
}

function hasRequiredParams(params?: Partial<ProductionAnalysisParams>) {
  return Boolean(
    params?.data_producao_inicio?.trim() &&
      params?.data_producao_fim?.trim() &&
      String(params?.usuario ?? "").trim(),
  );
}

export function useProductionAnalysis(
  params?: Partial<ProductionAnalysisParams>,
  options?: UseProductionAnalysisOptions,
) {
  const enabled = (options?.enabled ?? true) && hasRequiredParams(params);

  return useQuery({
    queryKey: [
      "production-analysis",
      params?.data_producao_inicio ?? "",
      params?.data_producao_fim ?? "",
      params?.janela_inicio ?? "",
      params?.fim ?? "",
      params?.usuario ?? "",
      params?.projeto_id ?? "",
    ],
    enabled,
    queryFn: () =>
      getProductionAnalysis({
        data_producao_inicio: params!.data_producao_inicio!,
        data_producao_fim: params!.data_producao_fim!,
        janela_inicio: params?.janela_inicio,
        fim: params?.fim,
        usuario: params!.usuario!,
        projeto_id: params?.projeto_id,
      }),
  });
}

export type {
  ProductionAnalysisColaborador,
  ProductionAnalysisData,
  ProductionAnalysisParams,
  ProductionAnalysisResponse,
  ProductionAnalysisResumoSquad,
};
