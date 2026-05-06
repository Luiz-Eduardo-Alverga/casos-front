export interface PainelKanbanFiltrosForm {
  produto: string;
  versao: string;
  devAtribuido: string;
  /**
   * Label do usuário selecionado no filtro "Ver como".
   * Usado para restaurar a combobox corretamente quando as opções são lazy-loaded.
   */
  devAtribuidoLabel?: string;
}
