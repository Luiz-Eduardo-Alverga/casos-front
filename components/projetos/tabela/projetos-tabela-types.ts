import type { SgpCadastroData } from "@/interfaces/sgp-cadastro";

export type ProjetosTabelaVariant = "listagem" | "escopo";

export interface ProjetosTabelaEscopoRow {
  id: string;
  numero: string;
  descricao: string;
  categoria: string;
  produto: string;
  versao: string;
  tipo_abertura?: string;
  estimado_minutos: number;
  realizado_minutos: number;
  desenvolvedor: string;
  status: string;
  showNaoPlanejado: boolean;
  showViavel: boolean;
  showDuplicado: boolean;
}

export interface ProjetosTabelaTableListagemProps {
  variant?: "listagem";
  itens: SgpCadastroData[];
  isFetchingNextPage: boolean;
  showCheckbox?: boolean;
}

export interface ProjetosTabelaTableEscopoProps {
  variant: "escopo";
  itens: ProjetosTabelaEscopoRow[];
  isFetchingNextPage: boolean;
  showCheckbox?: boolean;
  selectedIds?: string[];
  onToggleItem?: (id: string, checked: boolean) => void;
  onToggleAll?: (checked: boolean) => void;
}

export type ProjetosTabelaTableProps =
  | ProjetosTabelaTableListagemProps
  | ProjetosTabelaTableEscopoProps;
