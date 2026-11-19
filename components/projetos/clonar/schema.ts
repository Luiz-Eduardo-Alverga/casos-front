import { z } from "zod";

export const NOME_PROJETO_MAX = 120;

export const projetoClonarSchema = z
  .object({
    nomeProjeto: z
      .string()
      .trim()
      .min(1, "Informe o nome do novo projeto")
      .max(NOME_PROJETO_MAX, `Use no máximo ${NOME_PROJETO_MAX} caracteres`),
    dataInicio: z.date({
      required_error: "Informe a data de início",
      invalid_type_error: "Informe a data de início",
    }),
    dataFim: z.date({
      required_error: "Informe a data de fim",
      invalid_type_error: "Informe a data de fim",
    }),
  })
  .refine((v) => v.dataFim >= v.dataInicio, {
    path: ["dataFim"],
    message: "A data de fim deve ser igual ou posterior à de início",
  });

export type ProjetoClonarFormValues = z.infer<typeof projetoClonarSchema>;

/** Valores do formulário antes da validação (datas podem estar vazias). */
export interface ProjetoClonarFormInput {
  nomeProjeto: string;
  dataInicio?: Date;
  dataFim?: Date;
}
