import { z } from "zod";
import { todayIsoDate } from "@/components/produtos/edicao/versoes/utils";

const versaoRegex = /^\d+(\.\d+)*$/;

export const versaoFormSchema = z
  .object({
    versao: z
      .string()
      .trim()
      .min(1, "Informe a versão")
      .regex(versaoRegex, "Use apenas números e pontos, como 8.1.1.0"),
    status: z.enum(["ABERTO", "FECHADO"]),
    abertura: z.string().trim().min(1, "Informe a data de abertura"),
    fechamento: z.string().optional(),
    testadorId: z.string().optional(),
    notas: z.string().optional(),
    helptools: z.boolean(),
    estacionamentoIdeias: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const fechamento = data.fechamento?.trim();
    if (fechamento && data.abertura && fechamento < data.abertura) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fechamento"],
        message: "Não pode ser anterior à data de abertura",
      });
    }
  });

export type VersaoFormData = z.infer<typeof versaoFormSchema>;

export function getVersaoFormDefaultValues(): VersaoFormData {
  return {
    versao: "",
    status: "ABERTO",
    abertura: todayIsoDate(),
    fechamento: "",
    testadorId: "",
    notas: "",
    helptools: false,
    estacionamentoIdeias: false,
  };
}
