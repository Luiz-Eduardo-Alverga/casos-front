export interface CasoFormAnexosProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  /** Sem `Card` externo (útil dentro de outro card, ex.: aba de edição). */
  embedded?: boolean;
  /** Controle externo do modal (abertura de caso). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
