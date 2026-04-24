import { z } from "zod";

export const roleCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(256),
  description: z.string().nullable().optional(),
});

export const roleUpdateSchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export type RoleCreateInput = z.infer<typeof roleCreateSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
