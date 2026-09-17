import { z } from "zod";
import { PRODUTO_LABELS } from "@/components/produtos/constants";

export const moduloFormSchema = z.object({
  nome: z.string().trim().min(1, PRODUTO_LABELS.informeNomeModulo),
  ordemImpressao: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d+$/.test(value),
      PRODUTO_LABELS.ordemInvalida,
    ),
});

export type ModuloFormData = z.infer<typeof moduloFormSchema>;

export function getModuloFormDefaultValues(): ModuloFormData {
  return {
    nome: "",
    ordemImpressao: "",
  };
}
