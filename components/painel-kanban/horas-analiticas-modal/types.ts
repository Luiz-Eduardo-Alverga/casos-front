import type { ProducaoHorasAnaliticasItem } from "@/hooks/producao/use-producao-horas-analiticas";

export interface HorasAnaliticasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produtoId: string;
  produtoLabel: string;
  colaboradorLabel: string;
  projetoId: string;
  projetoLabel: string;
  usuarioId: string;
}

export interface HorasAnaliticasResumo {
  minutosTecnicos: number;
  minutosNaoTecnicos: number;
  minutosTotais: number;
  totalCasos: number;
}

export interface HorasAnaliticasCaseItem {
  id: string;
  registro: string;
  descricaoResumo: string;
  tipo: string;
  horaAbertura: string;
  horaFechamento: string;
  minutosRealizados: number;
  produtoVersao: string;
}

export interface HorasAnaliticasParsedData {
  resumo: HorasAnaliticasResumo;
  casos: HorasAnaliticasCaseItem[];
}

export interface HorasAnaliticasSummaryCardsProps {
  resumo: HorasAnaliticasResumo;
}

export interface HorasAnaliticasCasesListProps {
  casos: HorasAnaliticasCaseItem[];
}

export interface HorasAnaliticasCommitBoxProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerateDisabled?: boolean;
}

export type HorasAnaliticasEmptyStateVariant =
  | "sem_filtros"
  | "sem_resultados";

export interface HorasAnaliticasEmptyStateProps {
  variant: HorasAnaliticasEmptyStateVariant;
  onApplyFilters: () => void;
  isApplyFiltersDisabled?: boolean;
}

export type HorasAnaliticasApiItem = ProducaoHorasAnaliticasItem;
