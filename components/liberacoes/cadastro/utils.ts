import type { CreateLiberacaoRequest } from "@/interfaces/liberacao";
import { DEFAULT_STATUS_LIBERACAO } from "@/components/liberacoes/constants";
import { formatLiberacaoDateApi } from "@/components/liberacoes/utils";
import type { LiberacaoCreateFormData } from "@/components/liberacoes/cadastro/schema";

export function buildCreateLiberacaoPayload(
  data: LiberacaoCreateFormData,
): CreateLiberacaoRequest {
  return {
    produto_id: Number(data.produtoId),
    tipo_liberacao: data.tipoLiberacao,
    status: DEFAULT_STATUS_LIBERACAO,
    versao_final_data_prevista: formatLiberacaoDateApi(
      data.versaoFinalDataPrevista,
    ),
    observacao: data.observacao?.trim() || null,
    versoes: data.versoes,
  };
}
