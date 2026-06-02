import z from "zod";
import { reportCreateFormSchema } from "@/components/casos/cadastro/report-create/schema";

export const reportEditFormSchema = reportCreateFormSchema.extend({
  modulo: z.string(),
  versao: z.string(),
  projeto: z.string(),
  origem: z.string(),
  qaAtribuido: z.string(),
  InformacoesAdicionais: z.string().optional(),
  status: z.string().min(1, "Status é obrigatório"),
  analiseStatus: z.string().optional(),
  reportPrioridade: z.string().optional(),
});

export type ReportEditFormData = z.infer<typeof reportEditFormSchema>;
