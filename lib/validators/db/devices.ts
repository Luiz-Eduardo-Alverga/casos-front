import { z } from "zod";

export const deviceCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export const deviceUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualizar",
  });

export type DeviceCreateInput = z.infer<typeof deviceCreateSchema>;
export type DeviceUpdateInput = z.infer<typeof deviceUpdateSchema>;
