import { z } from "zod";

export const riscoHistoricoFormSchema = z.object({
  idSeq: z.string().min(1, "Selecione o risco"),
  dataHistorico: z.date({ required_error: "Informe a data da ocorrência" }),
  descricao: z.string().min(1, "Informe a descrição"),
  impacto: z.string().min(1, "Informe o impacto gerado"),
});

export type RiscoHistoricoFormValues = z.infer<typeof riscoHistoricoFormSchema>;

export const riscoHistoricoFormDefaultValues: RiscoHistoricoFormValues = {
  idSeq: "",
  dataHistorico: new Date(),
  descricao: "",
  impacto: "",
};
