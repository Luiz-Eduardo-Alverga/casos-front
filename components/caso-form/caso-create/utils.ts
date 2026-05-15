import type { UseFormSetValue } from "react-hook-form";
import {
  buildCasoCreatePayload as buildCasoCreatePayloadShared,
  type BuildCasoCreatePayloadArgs as BuildCasoPayloadArgsShared,
} from "@/components/caso-form/shared/payload";
import type { CasoCreateFormData } from "./schema";

export function clearTextOnlyFields(
  setValue: UseFormSetValue<CasoCreateFormData>,
) {
  setValue("DescricaoResumo", "");
  setValue("DescricaoCompleta", "");
  setValue("InformacoesAdicionais", "");
}

export type BuildCasoPayloadArgs = Omit<BuildCasoPayloadArgsShared, "data"> & {
  data: CasoCreateFormData;
};

/** Mapeia o formulário da tela para o payload da API de criação de caso. */
export function buildCasoCreatePayload(args: BuildCasoPayloadArgs) {
  return buildCasoCreatePayloadShared(args);
}
