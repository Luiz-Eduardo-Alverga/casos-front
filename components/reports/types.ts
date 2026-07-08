import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";

/** Filtros aplicados na listagem de reports abertos. */
export interface ReportsFiltrosAplicados {
  /** ID do setor, enviado como nome no param `setor` da API. */
  setor: string;
  /** ID do produto, enviado no param `produto_id`. */
  produto: string;
  /** Label da categoria, enviado no param `tipo_categoria` da API. */
  tipo_categoria: string;
  /** IDs de status (Registro), enviados no param `status_id`. */
  status_ids: string[];
}

export interface ReportsFiltersForm {
  setor: string;
  produto: string;
  categoria: string;
  status_ids: string[];
}

export const DEFAULT_REPORTS_STATUS_IDS = ["1"] as const;

export const EMPTY_REPORTS_FILTERS: ReportsFiltrosAplicados = {
  setor: "",
  produto: "",
  tipo_categoria: "",
  status_ids: [...DEFAULT_REPORTS_STATUS_IDS],
};

/** Estilo visual (borda/badge) aplicado por prioridade do report. */
export interface ReportPrioridadeStyle {
  /** Cor da borda lateral esquerda do card. */
  border: string;
  /** Container do badge de prioridade. */
  badgeContainer: string;
  /** Cor do ponto do badge de prioridade. */
  badgeDot: string;
  /** Cor do texto do badge de prioridade. */
  badgeText: string;
}

/** Modo de visualização da listagem de reports. */
export type ReportsViewMode = "cards" | "split";

/** Dados normalizados de um report para o card da listagem. */
export interface ReportCardData {
  id: number;
  prioridade: string;
  categoria: string;
  status: string;
  statusId: number;
  descricaoResumo: string;
  descricaoCompleta: string;
  produtoNome: string;
  relatorNome: string;
  responsavelNome: string;
  dataAbertura: string | null;
  dataLimite: string | null;
  /** Item completo (usado no modal de aprovação). */
  item: ProjetoMemoriaItem;
}
