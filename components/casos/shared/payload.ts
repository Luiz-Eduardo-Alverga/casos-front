/** Reexporta os helpers puros de payload, que moram em `lib/casos/payload`. */
export {
  buildCasoBasePayload,
  buildCasoCreatePayload,
  buildCasoUpdatePayload,
  extractVersaoProduto,
  type BuildCasoBasePayloadOptions,
  type BuildCasoCreatePayloadArgs,
  type BuildCasoUpdatePayloadArgs,
  type CasoBaseFormInput,
  type CasoUpdateReportFields,
} from "@/lib/casos/payload";
