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
  qtd_clientes_vinculados: number;
  relacoes: CasoRelacoes[];
  produto: string;
  produtoId?: string;
  versao: string;
  tipo_abertura?: string;
  estimado_minutos: number;
  realizado_minutos: number;
  desenvolvedor: string;
  qa: string;
  status: string;
  showNaoPlanejado: boolean;
  showViavel: boolean;
  showDuplicado: boolean;
  /** Produção do caso em andamento (alguém está com o tempo rodando). */
  emProducao: boolean;
}

export interface ProjetosTabelaTableListagemProps {
  variant?: "listagem";
  itens: SgpCadastroData[];
  isFetchingNextPage: boolean;
  showCheckbox?: boolean;
  /** Mostra o botão Clonar nas linhas; ausente = sem permissão. */
  onClonar?: (item: SgpCadastroData) => void;
  /** Projeto recém-clonado: linha com destaque e selo "Novo". */
  destaque?: ProjetoClonadoDestaque | null;
}

export interface ProjetoClonadoDestaque {
  registro: number;
  origemRegistro: number;
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
