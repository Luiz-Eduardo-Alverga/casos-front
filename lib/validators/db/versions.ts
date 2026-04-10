import { z } from "zod";

export const versionCreateSchema = z.object({
  name: z.string().nullable().optional(),
});

export const versionUpdateSchema = z
  .object({
    name: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualizar",
  });

export type VersionCreateInput = z.infer<typeof versionCreateSchema>;
export type VersionUpdateInput = z.infer<typeof versionUpdateSchema>;
