import type { ColaboradorIndicador } from "@/services/rh/get-colaboradores-indicadores";
import type { UseFormReturn } from "react-hook-form";

export type IndicadorAtalho = "mes-anterior" | "mes-atual" | "so-o-meu";

export type IndicadoresColunaVariant = "alcancou" | "resta";

export interface IndicadoresFiltrosForm {
  devAtribuido: string;
  devAtribuidoLabel: string;
}

export interface IndicadoresPremiacao {
  potencial: number;
  alcancado: number;
  emAberto: number;
  percentual: number;
  pendentes: number;
}

export interface IndicadoresFiltrosProps {
  form: UseFormReturn<IndicadoresFiltrosForm>;
  dataInicial: Date | undefined;
  dataFinal: Date | undefined;
  onDataInicialChange: (date: Date | undefined) => void;
  onDataFinalChange: (date: Date | undefined) => void;
  canViewOthers: boolean;
  atalho: IndicadorAtalho | null;
  onAtalho: (atalho: IndicadorAtalho) => void;
}

export interface IndicadoresPremiacaoProps {
  premiacao: IndicadoresPremiacao;
  periodoLabel: string;
}

export interface IndicadoresColunaProps {
  variant: IndicadoresColunaVariant;
  items: ColaboradorIndicador[];
  somaLabel: string;
  recalculatingId: number | null;
  onDetalhe: (item: ColaboradorIndicador) => void;
  onRecalcular: (item: ColaboradorIndicador) => void;
}

export interface IndicadoresItemProps {
  item: ColaboradorIndicador;
  showHoverRecalc?: boolean;
  isRecalculating?: boolean;
  onDetalhe: (item: ColaboradorIndicador) => void;
  onRecalcular: (item: ColaboradorIndicador) => void;
}

export interface IndicadoresMobileTabsProps {
  alcancou: ColaboradorIndicador[];
  resta: ColaboradorIndicador[];
  recalculatingId: number | null;
  onDetalhe: (item: ColaboradorIndicador) => void;
  onRecalcular: (item: ColaboradorIndicador) => void;
}

export interface IndicadoresDetalheDialogProps {
  item: ColaboradorIndicador | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodoLabel: string;
  isRecalculating: boolean;
  onRecalcular: (item: ColaboradorIndicador) => void;
}

export type RecalcularTodosStatus = "fila" | "agora" | "concluido" | "erro";

export interface RecalcularTodosLinha {
  id: number;
  nomes: string;
  area: string;
  unidade: string;
  status: RecalcularTodosStatus;
  valorIndicador?: number;
  erroMensagem?: string;
}

export interface RecalcularIndicadoresTodosContexto {
  suporte_id: number;
  data_inicial: string;
  data_final: string;
}

export interface IndicadoresRecalcularTodosDialogProps {
  open: boolean;
  running: boolean;
  linhas: RecalcularTodosLinha[];
  premiacao?: IndicadoresPremiacao;
  onAtualizarTela: () => void;
  onClose: () => void;
}
