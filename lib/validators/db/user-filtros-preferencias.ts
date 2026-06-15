import { z } from "zod";

const VALID_FIELDS = [
  "produto",
  "versao",
  "status_ids",
  "modulo",
  "categoria",
  "projeto_id",
  "tipo_abertura",
  "descricao_resumo",
  "usuario_abertura_id",
  "devAtribuido",
  "qaAtribuido",
  "data_producao_inicio",
  "data_producao_fim",
] as const;

export const filtroResumoItemSchema = z.object({
  field: z.enum(VALID_FIELDS),
  colSpan: z.union([z.literal(1), z.literal(2)]),
});

export const upsertFiltrosResumoSchema = z
  .array(filtroResumoItemSchema)
  .min(1, "É necessário ao menos um filtro")
  .refine(
    (items) => items.reduce((acc, i) => acc + i.colSpan, 0) === 4,
    "A soma dos colSpans deve ser exatamente 4",
  )
  .refine(
    (items) => new Set(items.map((i) => i.field)).size === items.length,
    "Não é permitido adicionar o mesmo filtro mais de uma vez",
  );

export type UpsertFiltrosResumoInput = z.infer<typeof upsertFiltrosResumoSchema>;
