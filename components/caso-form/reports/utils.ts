import type { UseFormSetValue } from "react-hook-form";
import type { ReportsFormData } from "./schema";

/** Limpa só campos de texto livre (igual ao fluxo pós-envio). */
export function clearTextOnlyFields(
  setValue: UseFormSetValue<ReportsFormData>,
) {
  setValue("DescricaoResumo", "");
  setValue("DescricaoCompleta", "");
  setValue("InformacoesAdicionais", "");
}

export interface BuildCasoPayloadArgs {
  data: ReportsFormData;
  naoPlanejado: boolean;
  userId?: string | number | null;
}

/** Mapeia o formulário da tela para o payload da API de criação de caso. */
export function buildCasoCreatePayload({
  data,
  naoPlanejado,
  userId,
}: BuildCasoPayloadArgs) {
  const versaoProduto = data.versao
    ? data.versao.split("-")[1]?.trim() || data.versao
    : "";

  return {
    Projeto: Number(data.produto),
    VersaoProduto: versaoProduto,
    Prioridade: Number(data.importancia),
    Cronograma_id: Number(data.projeto),
    Modulo: data.modulo || "",
    Id_Origem: data.origem || "",
    Categoria: Number(data.categoria),
    Relator: Number(data.relator),
    AtribuidoPara: Number(data.devAtribuido),
    atribuido_qa: Number(data.qaAtribuido),
    DescricaoResumo: data.DescricaoResumo || "",
    DescricaoCompleta: (data.DescricaoCompleta || "").replace(
      /\r?\n/g,
      "\r\n",
    ),
    InformacoesAdicionais: data.InformacoesAdicionais || "",
    status: "1",
    Id_Usuario_AberturaCaso: String(userId ?? ""),
    NaoPlanejado: naoPlanejado ? 1 : 0,
  };
}
