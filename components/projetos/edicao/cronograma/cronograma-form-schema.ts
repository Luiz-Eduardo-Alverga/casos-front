import { z } from "zod";

const horasRegex = /^\d{1,2}:\d{2}$/;

export const cronogramaFormSchema = z
  .object({
    idPapel: z.string().min(1, "Selecione o papel"),
    idTipo: z.string().min(1, "Selecione a tarefa"),
    colaboradorId: z.string().min(1, "Selecione o responsável"),
    colaboradorLabel: z.string().optional(),
    horaPrevista: z
      .string()
      .min(1, "Informe as horas previstas")
      .regex(horasRegex, "Use o formato HH:mm"),
    dataInicio: z.date().optional(),
    dataTermino: z.date().optional(),
    dataRealizacao: z.date().optional(),
    observacao: z.string().optional(),
  })
  .refine((data) => data.dataInicio instanceof Date, {
    message: "Informe a data de início",
    path: ["dataInicio"],
  })
  .refine((data) => data.dataTermino instanceof Date, {
    message: "Informe a data de término",
    path: ["dataTermino"],
  });

export type CronogramaFormValues = z.infer<typeof cronogramaFormSchema>;

export const cronogramaFormDefaultValues: CronogramaFormValues = {
  idPapel: "",
  idTipo: "",
  colaboradorId: "",
  colaboradorLabel: "",
  horaPrevista: "00:00",
  dataInicio: undefined,
  dataTermino: undefined,
  dataRealizacao: undefined,
  observacao: "",
};
