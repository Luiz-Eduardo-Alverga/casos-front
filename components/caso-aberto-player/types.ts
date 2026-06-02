export interface CasoAbertoPlayerViewModel {
  casoId: number;
  titulo: string;
  titleLine: string;
  pathDescription: string;
  prioridadeBadge: string | null;
  statusLabel: string;
  produtoNome: string;
  produtoVersao: string;
  horaAbertura: string;
  horaAberturaIso: string;
  tipoProducao: string;
  progressPercent: number;
  realizadoMinutos: number;
  estimadoMinutos: number;
}

export interface CasoAbertoMiniPlayerCollapsedProps {
  viewModel: CasoAbertoPlayerViewModel;
  onExpand: () => void;
}

export interface CasoAbertoMiniPlayerExpandedProps {
  viewModel: CasoAbertoPlayerViewModel;
  onCollapse: () => void;
  onVerCaso: () => void;
  onFinalizarCaso: () => void;
  onParar: () => void;
  isParando: boolean;
  isFinalizando: boolean;
}
