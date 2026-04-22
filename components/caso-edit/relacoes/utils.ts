import {
  TIPO_RELACAO_CASO_LABEL,
  type TipoRelacaoCaso,
} from "@/services/projeto-casos-relacoes/create";

export const TIPO_RELACAO_VALUES = Object.entries(TIPO_RELACAO_CASO_LABEL).map(
  ([value, label]) => ({
    value,
    label,
  })
);

export function isTipoRelacaoCaso(value: number): value is TipoRelacaoCaso {
  return value >= 1 && value <= 5;
}

