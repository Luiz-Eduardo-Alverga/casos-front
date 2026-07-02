import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";

/** Filtros aplicados na listagem de reports abertos. */
export interface ReportsFiltrosAplicados {
  /** Nome do setor (ex.: "SQUAD XP"), enviado no param `setor`. */
  setor?: string;
  /** ID do produto, enviado no param `produto_id`. */
  produto?: string;
}

export interface ReportsFiltersForm {
  setor: string;
  produto: string;
}

export const EMPTY_REPORTS_FILTERS: ReportsFiltrosAplicados = {
  setor: "",
  produto: "",
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
