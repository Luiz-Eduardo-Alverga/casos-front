import { z } from "zod";

export const roleCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(256),
  description: z.string().nullable().optional(),
  hierarchyLevel: z
    .number()
    .int("Nível deve ser inteiro")
    .min(1, "Nível mínimo é 1"),
});

export const roleUpdateSchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().nullable().optional(),
    hierarchyLevel: z.number().int().min(1).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export type RoleCreateInput = z.infer<typeof roleCreateSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
