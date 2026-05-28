import type { ProductionAnalysisColaborador } from "@/hooks/producao/use-production-analysis";

export type AuditStatusKey =
  | "CONFORME"
  | "ALERTA_LEVE"
  | "ALERTA_CRITICO"
  | "INCONSISTENCIA";

export interface AuditoriaFiltersForm {
  projeto: string;
  devAtribuido: string;
  devAtribuidoLabel: string;
}

export interface AuditoriaFiltrosProps {
  dataProducao: Date | undefined;
  onDataProducaoChange: (date: Date | undefined) => void;
  canAuditAllUsers: boolean;
  canAudit: boolean;
  isFetching: boolean;
  onAuditar: () => void;
}

export interface AuditoriaSummaryCardsProps {
  resumo: {
    total_colaboradores: number;
    conforme: { count: number; percentual: number };
    alerta_leve: { count: number; percentual: number };
    alerta_critico: { count: number; percentual: number };
    inconsistencia: { count: number; percentual: number };
  };
}

export interface AuditoriaColaboradoresTableProps {
  colaboradores: ProductionAnalysisColaborador[];
  projetoLabel: string;
}

export interface AuditoriaColaboradorRowProps {
  colaborador: ProductionAnalysisColaborador;
  projetoLabel: string;
  onOpenDetail: (colaborador: ProductionAnalysisColaborador) => void;
}

export interface AuditoriaDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaborador: ProductionAnalysisColaborador | null;
}

export interface AuditoriaEmptyStateProps {
  variant: "sem_auditoria" | "sem_resultados";
}
