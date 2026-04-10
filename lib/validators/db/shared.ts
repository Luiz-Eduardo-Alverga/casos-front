import { z } from "zod";

/** Espelha `status_type` no Postgres; ao adicionar valor, atualizar enum no banco e aqui. */
export const statusTypeSchema = z.enum([
  "Em desenvolvimento",
  "Em teste",
  "Em homologação",
  "Em certificação",
  "Concluído",
]);

/** Data no formato `YYYY-MM-DD` (coluna `date` do Postgres). */
export const isoDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato YYYY-MM-DD");

export const uuidSchema = z.string().uuid();
