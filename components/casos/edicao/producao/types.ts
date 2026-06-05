import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";

export interface AbaProducaoSavePayload {
  TempoEstimado?: string | null;
  tamanho?: number | null;
  NaoPlanejado?: number | boolean;
}

export interface AbaProducaoProps {
  item: ProjetoMemoriaItem;
  /** Quando true, exibe apenas leitura (sem formulários nem ações). */
  readOnly?: boolean;
}

