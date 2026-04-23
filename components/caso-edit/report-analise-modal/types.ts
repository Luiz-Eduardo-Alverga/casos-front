import type { ProjetoMemoriaReport } from "@/interfaces/projeto-memoria";

export interface ReportAnaliseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ProjetoMemoriaReport;
  onSalvar: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

