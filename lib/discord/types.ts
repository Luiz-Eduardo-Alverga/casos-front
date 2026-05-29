export type CasoDiscordNotifyOrigem = "criado" | "clonado" | "report";

export interface CasoDiscordNotifyInput {
  registro: number;
  atribuidoPara: number;
  prioridade: number;
  descricaoResumo: string;
  /** ID do produto (campo `Projeto` / `projeto` na API). */
  produtoId?: number;
  /** ID do cronograma / projeto (`Cronograma_id` / `cronograma_id`). */
  cronogramaId?: number;
  versaoProduto?: string;
  aberturaUsuarioId?: string | number | null;
  origem?: CasoDiscordNotifyOrigem;
}

export interface AuxiliarUsuarioDiscord {
  id: string;
  nome_suporte: string;
  usuario_discord: string;
}
