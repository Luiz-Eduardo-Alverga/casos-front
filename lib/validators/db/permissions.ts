import { z } from "zod";
import { uuidSchema } from "@/lib/validators/db/shared";

export const permissionCreateSchema = z.object({
  moduleId: uuidSchema,
  code: z.string().min(1, "Código é obrigatório").max(256),
  label: z.string().min(1, "Rótulo é obrigatório").max(256),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const permissionUpdateSchema = z
  .object({
    moduleId: uuidSchema.optional(),
    code: z.string().min(1).max(256).optional(),
    label: z.string().min(1).max(256).optional(),
    description: z.string().nullable().optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export type PermissionCreateInput = z.infer<typeof permissionCreateSchema>;
export type PermissionUpdateInput = z.infer<typeof permissionUpdateSchema>;
