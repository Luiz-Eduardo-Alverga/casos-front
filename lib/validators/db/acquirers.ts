import { z } from "zod";

export const acquirerCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  logoUrl: z.union([z.string().url(), z.null()]).optional(),
  has4g: z.boolean().optional(),
});

export const acquirerUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    logoUrl: z.union([z.string().url(), z.null()]).optional(),
    has4g: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualizar",
  });

export type AcquirerCreateInput = z.infer<typeof acquirerCreateSchema>;
export type AcquirerUpdateInput = z.infer<typeof acquirerUpdateSchema>;
