export interface PainelKanbanFiltrosForm {
  produto: string;
  versao: string;
  devAtribuido: string;
  /**
   * Label do usuário selecionado no filtro "Ver como".
   * Usado para restaurar a combobox corretamente quando as opções são lazy-loaded.
   */
  devAtribuidoLabel?: string;
  /**
   * Setor do usuário selecionado no filtro "Ver como".
   * Usado para buscar projetos no filtro de Projeto sem depender de produto.
   */
  devAtribuidoSetor?: string;
  /** Projeto selecionado para filtrar o kanban (opcional). */
  projeto?: string;
  /** True enquanto o campo de projeto está carregando/auto-definindo no Kanban. */
  projetoLoading?: boolean;
}
