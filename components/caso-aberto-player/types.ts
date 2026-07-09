export type DocumentPictureInPictureWindow = Window & {
  document: Document;
};

export type CasoAbertoPipLayout = "collapsed" | "expanded";

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
  descricaoResumo: string;
  descricaoCompleta: string;
  anexo: string;
  usuarioAbertura: string;
  relator: string;
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
  onCopiarCommit: () => void;
  onCopiarTextoCompleto: () => void;
  onAbrirPip: () => void;
  isParando: boolean;
  isFinalizando: boolean;
  isPipOpen: boolean;
  isPipSupported: boolean;
}
