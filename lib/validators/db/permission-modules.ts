import { z } from "zod";

const slugSchema = z
  .string()
  .min(1, "Slug é obrigatório")
  .max(128)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use apenas letras minúsculas, números e hífens (ex.: gestao-usuarios)",
  );

export const permissionModuleCreateSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const permissionModuleUpdateSchema = z
  .object({
    slug: slugSchema.optional(),
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export type PermissionModuleCreateInput = z.infer<
  typeof permissionModuleCreateSchema
>;
export type PermissionModuleUpdateInput = z.infer<
  typeof permissionModuleUpdateSchema
>;
