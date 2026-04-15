import type { ProdutoOrdem } from "@/services/projeto-dev/get-produtos-ordem";

export interface ModalProdutoFormValues {
  produto: string;
  versao: string;
}

export interface PainelKanbanProdutosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idColaborador: string;
}

export interface ProdutosModalListState {
  items: ProdutoOrdem[];
  editingItemId: string | null;
  editVersao: string;
  editingProdutoId: string;
}

