import type { CasoRelacoes } from "@/interfaces/projeto-memoria";

export interface AbaRelacoesProps {
  relacoes: CasoRelacoes[];
}

export type RelacaoFormValues = {
  tipo_relacao: string;
  caso_relacionado: string;
  descricao_resumo: string;
};

