import type { CasoRelacoes } from "@/interfaces/projeto-memoria";
import type { ProjetoMemoriaSortState } from "@/components/projetos/tabela/projeto-memoria-sort";
import type { SgpCadastroData } from "@/interfaces/sgp-cadastro";

export type ProjetosTabelaVariant = "listagem" | "escopo";

export interface ProjetosTabelaEscopoRow {
  importancia: string;
  dataConclusao: string | null;
  projetoId: string;
  id: string;
  numero: string;
  descricao: string;
  categoria: string;
  dias_no_backlog: number;
  relacoes: CasoRelacoes[];
  produto: string;
  produtoId?: string;
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
  sort?: ProjetoMemoriaSortState;
  onSortChange?: (sort: ProjetoMemoriaSortState) => void;
}

export type ProjetosTabelaTableProps =
  | ProjetosTabelaTableListagemProps
  | ProjetosTabelaTableEscopoProps;
