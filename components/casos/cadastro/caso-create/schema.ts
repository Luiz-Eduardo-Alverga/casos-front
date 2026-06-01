import z from "zod";

export const assistantFormSchema = z.object({
  description: z.string(),
});

export const casoCreateFormSchema = z.object({
  produto: z
    .string({ required_error: "Produto é obrigatório" })
    .min(1, "Produto é obrigatório"),
  importancia: z
    .string({ required_error: "Importância é obrigatória" })
    .min(1, "Importância é obrigatória"),
  modulo: z.string({ required_error: "Módulo é obrigatório" }),
  categoria: z
    .string({ required_error: "Categoria é obrigatória" })
    .min(1, "Categoria é obrigatória"),
  devAtribuido: z
    .string({ required_error: "Dev atribuído é obrigatório" })
    .min(1, "Dev atribuído é obrigatório"),
  versao: z
    .string({ required_error: "Versão é obrigatória" })
    .min(1, "Versão é obrigatória"),
  projeto: z
    .string({ required_error: "Projeto é obrigatório" })
    .min(1, "Projeto é obrigatório"),
  origem: z
    .string({ required_error: "Origem é obrigatória" })
    .min(1, "Origem é obrigatória"),
  relator: z
    .string({ required_error: "Relator é obrigatório" })
    .min(1, "Relator é obrigatório"),
  qaAtribuido: z.string({ required_error: "QA atribuído é obrigatório" }),
  DescricaoResumo: z
    .string({ required_error: "Resumo é obrigatório" })
    .min(1, "Resumo é obrigatório"),
  DescricaoCompleta: z
    .string({ required_error: "Descrição completa é obrigatória" })
    .min(1, "Descrição completa é obrigatória"),
  InformacoesAdicionais: z.string().optional(),
});

export type CasoCreateFormData = z.infer<typeof casoCreateFormSchema>;
export type AssistantFormData = z.infer<typeof assistantFormSchema>;
