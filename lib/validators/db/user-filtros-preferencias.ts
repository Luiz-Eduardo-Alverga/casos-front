import { z } from "zod";

const VALID_FIELDS = [
  "produto",
  "versao",
  "status_ids",
  "modulo",
  "categoria",
  "projeto_id",
  "setor",
  "tipo_abertura",
  "descricao_resumo",
  "usuario_abertura_id",
  "devAtribuido",
  "qaAtribuido",
  "data_abertura_inicio",
  "data_abertura_final",
  "data_producao_inicio",
  "data_producao_fim",
  "nao_planejado",
] as const;

export const filtroResumoItemSchema = z.object({
  field: z.enum(VALID_FIELDS),
  colSpan: z.union([z.literal(1), z.literal(2)]),
});

const filtrosResumoLayoutRefinements = [
  {
    check: (items: { field: string }[]) =>
      new Set(items.map((i) => i.field)).size === items.length,
    message: "Não é permitido adicionar o mesmo filtro mais de uma vez",
  },
] as const;

export const filtrosResumoReadSchema = z
  .array(filtroResumoItemSchema)
  .min(1)
  .refine(filtrosResumoLayoutRefinements[0].check, {
    message: filtrosResumoLayoutRefinements[0].message,
  });

export const upsertFiltrosResumoSchema = z
  .array(filtroResumoItemSchema)
  .min(1, "É necessário ao menos um filtro")
  .refine(filtrosResumoLayoutRefinements[0].check, {
    message: filtrosResumoLayoutRefinements[0].message,
  });

export type UpsertFiltrosResumoInput = z.infer<typeof upsertFiltrosResumoSchema>;
