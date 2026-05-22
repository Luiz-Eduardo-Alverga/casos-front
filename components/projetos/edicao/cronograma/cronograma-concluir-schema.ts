import { z } from "zod";

export const cronogramaConcluirSchema = z.object({
  dataRealizacao: z.date({ required_error: "Informe a data de realização" }),
  observacao: z.string().optional(),
});

export type CronogramaConcluirFormValues = z.infer<typeof cronogramaConcluirSchema>;

export const cronogramaConcluirDefaultValues: Partial<CronogramaConcluirFormValues> =
  {
    observacao: "",
  };
