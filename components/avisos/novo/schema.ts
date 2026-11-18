import { z } from "zod";

export const TITULO_MAX = 120;

const listaFiltro = z.array(z.string());

export const novoAvisoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "Informe o título do aviso.")
    .max(TITULO_MAX, `O título pode ter no máximo ${TITULO_MAX} caracteres.`),
  descricao: z.string().trim().min(1, "Escreva a descrição do aviso."),
  auto: z.boolean(),
  modo: z.enum(["todos", "filtrar"]),
  filtros: z.object({
    pdv: listaFiltro,
    setor: listaFiltro,
    nivel: listaFiltro,
    funcao: listaFiltro,
  }),
  /** Usuários de "Adicionar usuário específico" (registro + dados para a linha). */
  extras: z.array(
    z.object({
      registro: z.number(),
      nome_suporte: z.string(),
      pdv: z.string(),
      setor: z.string(),
      nivel: z.string(),
      funcao: z.union([z.number(), z.string()]),
    }),
  ),
  /** Registros desmarcados na lista (saem do `suporte_ids`). */
  excluidos: z.array(z.number()),
});

export type NovoAvisoFormValues = z.infer<typeof novoAvisoSchema>;

export const NOVO_AVISO_DEFAULTS: NovoAvisoFormValues = {
  titulo: "",
  descricao: "",
  auto: true,
  modo: "filtrar",
  filtros: { pdv: [], setor: [], nivel: [], funcao: [] },
  extras: [],
  excluidos: [],
};
