import { z } from "zod";

const horasRegex = /^\d{1,2}:\d{2}$/;

export const stakeFormSchema = z.object({
  colaboradorId: z.string().min(1, "Selecione o colaborador"),
  idTipo: z.string().min(1, "Selecione a função"),
  diasUteis: z.coerce
    .number({ invalid_type_error: "Informe os dias úteis" })
    .int("Dias deve ser um número inteiro")
    .min(1, "Informe pelo menos 1 dia"),
  horasPlanejadas: z
    .string()
    .min(1, "Informe as horas planejadas")
    .regex(horasRegex, "Use o formato HH:mm"),
  horasNaoPlanejadas: z
    .string()
    .min(1, "Informe as horas não planejadas")
    .regex(horasRegex, "Use o formato HH:mm"),
});

export type StakeFormValues = z.infer<typeof stakeFormSchema>;

export const stakeFormDefaultValues: StakeFormValues = {
  colaboradorId: "",
  idTipo: "",
  diasUteis: 10,
  horasPlanejadas: "00:00",
  horasNaoPlanejadas: "00:00",
};
