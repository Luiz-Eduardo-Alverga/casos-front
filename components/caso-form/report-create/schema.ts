import z from "zod";

export const reportCreateFormSchema = z.object({
  produto: z
    .string({ required_error: "Produto é obrigatório" })
    .min(1, "Produto é obrigatório"),
  categoria: z
    .string({ required_error: "Categoria é obrigatória" })
    .min(1, "Categoria é obrigatória"),
  categoriaTipoLabel: z.string().optional(),
  importancia: z
    .string({ required_error: "Prioridade é obrigatória" })
    .min(1, "Prioridade é obrigatória"),
  reportOcorrenciaInicial: z.string().optional(),
  DescricaoResumo: z
    .string({ required_error: "Resumo é obrigatório" })
    .min(1, "Resumo é obrigatório"),
  DescricaoCompleta: z
    .string({ required_error: "Descrição completa é obrigatória" })
    .min(1, "Descrição completa é obrigatória"),
  reportAnaliseUsuarioId: z
    .string({ required_error: "Product Owner / QA é obrigatório" })
    .min(1, "Product Owner / QA é obrigatório"),
  reportResponsavelSuporteId: z
    .string({ required_error: "Responsável Suporte é obrigatório" })
    .min(1, "Responsável Suporte é obrigatório"),
});

export type ReportCreateFormData = z.infer<typeof reportCreateFormSchema>;
