import { z } from "zod";
import { PRODUTO_LABELS } from "@/components/produtos/constants";

export const scriptFormSchema = z.object({
  titulo: z.string().trim().min(1, PRODUTO_LABELS.informeTituloScript),
  ordem: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d+$/.test(value),
      PRODUTO_LABELS.ordemInvalida,
    ),
  procedimento: z
    .string()
    .trim()
    .min(1, PRODUTO_LABELS.informeProcedimento),
});

export type ScriptFormData = z.infer<typeof scriptFormSchema>;

export function getScriptFormDefaultValues(): ScriptFormData {
  return {
    titulo: "",
    ordem: "",
    procedimento: "",
  };
}
