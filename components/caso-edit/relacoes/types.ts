import type { CasoRelacoes } from "@/interfaces/projeto-memoria";
import type { TipoRelacaoCaso } from "@/services/projeto-casos-relacoes/create";

export interface AbaRelacoesProps {
  casoId: number;
  relacoes: CasoRelacoes[];
  onAdd: (payload: {
    registro: number;
    tipo_relacao: TipoRelacaoCaso;
    caso_relacionado: number;
    descricao_resumo: string;
  }) => Promise<void>;
  onUpdate: (payload: {
    id: number;
    data: {
      tipo_relacao: TipoRelacaoCaso;
      caso_relacionado: number;
      descricao_resumo: string;
    };
  }) => Promise<void>;
  onDelete: (sequencia: number) => Promise<void>;
  isAdding?: boolean;
  isUpdating?: boolean;
}

export type RelacaoFormValues = {
  tipo_relacao: string;
  caso_relacionado: string;
  descricao_resumo: string;
};

