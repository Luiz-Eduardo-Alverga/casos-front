import { z } from "zod";

export const escopoDuplicarCasosSchema = z.object({
  projeto: z.string().min(1, "Selecione o projeto destino"),
});

export type EscopoDuplicarCasosFormValues = z.infer<
  typeof escopoDuplicarCasosSchema
>;

export const escopoDuplicarCasosDefaultValues: EscopoDuplicarCasosFormValues = {
  projeto: "",
};
