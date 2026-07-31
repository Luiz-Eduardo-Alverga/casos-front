import type { LiberacaoItem, UpdateLiberacaoRequest } from "@/interfaces/liberacao";
import { formatLiberacaoDateApi, parseLiberacaoDate } from "@/components/liberacoes/utils";
import type { LiberacaoEditFormData } from "@/components/liberacoes/edicao/schema";

export function liberacaoToFormValues(lib: LiberacaoItem): LiberacaoEditFormData {
  return {
    produtoId: String(lib.produto_id),
    tipoLiberacao: lib.tipo_liberacao,
    observacao: lib.observacao ?? "",
    linkVideo: lib.link_video ?? "",
    linkPdf: lib.link_pdf ?? "",
    urlVersaoPiloto: lib.url_versao_piloto ?? "",
    previsaoLiberacao: parseLiberacaoDate(lib.previsao_liberacao),
    previsaoPiloto: parseLiberacaoDate(lib.previsao_piloto),
    pilotoDataPrevista: parseLiberacaoDate(lib.piloto_data_prevista),
    pilotoDataLiberacao: parseLiberacaoDate(lib.piloto_data_liberacao),
    versaoFinalDataPrevista: parseLiberacaoDate(lib.versao_final_data_prevista),
    melhoriasDataInicial: parseLiberacaoDate(lib.melhorias_data_inicial),
    melhoriasDataFinal: parseLiberacaoDate(lib.melhorias_data_final),
    gerarOcorrenciasLiberacao: lib.gerar_ocorrencias_liberacao,
  };
}

export function buildUpdateLiberacaoPayload(
  data: LiberacaoEditFormData,
): UpdateLiberacaoRequest {
  return {
    produto_id: Number(data.produtoId),
    tipo_liberacao: data.tipoLiberacao,
    observacao: data.observacao?.trim() || null,
    link_video: data.linkVideo?.trim() || null,
    link_pdf: data.linkPdf?.trim() || null,
    url_versao_piloto: data.urlVersaoPiloto?.trim() || null,
    previsao_liberacao: formatLiberacaoDateApi(data.previsaoLiberacao),
    previsao_piloto: formatLiberacaoDateApi(data.previsaoPiloto),
    piloto_data_prevista: formatLiberacaoDateApi(data.pilotoDataPrevista),
    piloto_data_liberacao: formatLiberacaoDateApi(data.pilotoDataLiberacao),
    versao_final_data_prevista: formatLiberacaoDateApi(data.versaoFinalDataPrevista),
    melhorias_data_inicial: formatLiberacaoDateApi(data.melhoriasDataInicial),
    melhorias_data_final: formatLiberacaoDateApi(data.melhoriasDataFinal),
    gerar_ocorrencias_liberacao: data.gerarOcorrenciasLiberacao,
  };
}
