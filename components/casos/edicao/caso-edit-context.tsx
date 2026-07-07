"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CasoAberturaInfo } from "@/lib/casos/caso-abertura-info";

export interface CasoEditContextValue {
  /** ID do caso na rota / query `projeto-memoria`. */
  memoriaQueryId: string;
  /** ID numérico do caso exibido nos badges (#n). */
  numeroCaso: number;
  /** Metadados de abertura do caso (usuário, data e dias no backlog). */
  aberturaInfo?: CasoAberturaInfo;
  canEditCase: boolean;
  invalidate: () => void;
  isSaving: boolean;
  /** ID do status retornado pela API (não o valor do formulário). */
  statusIdApi: number;
  /** Submissão principal do formulário de edição do caso. */
  onSalvar: () => void;
  /**
   * Resolve o status REPORT equivalente a um status CASO selecionado
   * (considera `report_status_equivalente` da API + fallback de versão).
   * Disponível apenas quando o registro é um REPORT.
   */
  getReportStatusFromCasoStatus?: (status: number) => string | undefined;
  /** Rascunho da nova anotação (persiste entre abas; limpo ao salvar ou sair da tela). */
  novaAnotacaoDraft: string;
  setNovaAnotacaoDraft: (value: string) => void;
}

const CasoEditContext = createContext<CasoEditContextValue | undefined>(
  undefined,
);

interface CasoEditProviderProps {
  children: ReactNode;
  value: CasoEditContextValue;
}

export function CasoEditProvider({ children, value }: CasoEditProviderProps) {
  return (
    <CasoEditContext.Provider value={value}>{children}</CasoEditContext.Provider>
  );
}

export function useCasoEdit(): CasoEditContextValue {
  const ctx = useContext(CasoEditContext);
  if (ctx === undefined) {
    throw new Error("useCasoEdit deve ser usado dentro de CasoEditProvider.");
  }
  return ctx;
}
