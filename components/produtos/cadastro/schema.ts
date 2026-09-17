import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const produtoFormSchema = z.object({
  nomeProjeto: requiredText("Nome do produto é obrigatório"),
  setor: requiredText("Setor é obrigatório"),
  po: requiredText("Product Owner é obrigatório"),
  scrumMaster: requiredText("Scrum Master é obrigatório"),
  vinculadoA: z.string().optional(),
  necessidadeComercial: z
    .string()
    .optional()
    .refine((value) => !value?.trim() || /^\d+$/.test(value.trim()), {
      message: "Informe um ID numérico",
    }),
  responsavelSuporte: requiredText("Responsável suporte é obrigatório"),
  responsavelParametrizacao: requiredText(
    "Responsável parametrização é obrigatório",
  ),
  responsavelBugs: z.string().optional(),
  responsavelMelhorias: z.string().optional(),
  informacoesTecnicas: z.string().optional(),
  mostrarConsulta: z.boolean(),
  mostrarTeste: z.boolean(),
  faqExibir: z.boolean(),
  calcularBurndown: z.boolean(),
  vacaLeiteira: z.boolean(),
});

export type ProdutoFormData = z.infer<typeof produtoFormSchema>;

export function getProdutoCreateDefaultValues(): ProdutoFormData {
  return {
    nomeProjeto: "",
    setor: "",
    po: "",
    scrumMaster: "",
    vinculadoA: "",
    necessidadeComercial: "",
    responsavelSuporte: "",
    responsavelParametrizacao: "",
    responsavelBugs: "",
    responsavelMelhorias: "",
    informacoesTecnicas: "",
    mostrarConsulta: true,
    mostrarTeste: false,
    faqExibir: false,
    calcularBurndown: true,
    vacaLeiteira: false,
  };
}
