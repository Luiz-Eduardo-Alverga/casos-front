import { z } from "zod";
import { isoDateStringSchema, statusTypeSchema, uuidSchema } from "./shared";

export const acquirerStatusCreateSchema = z.object({
  acquirerId: uuidSchema,
  currentVersionId: uuidSchema,
  status: statusTypeSchema.optional(),
  nextVersionId: uuidSchema.nullable().optional(),
  deliveryDate: isoDateStringSchema.nullable().optional(),
  recommendedDeviceId: uuidSchema.nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  obs: z.string().nullable().optional(),
});

export const acquirerStatusUpdateSchema = z
  .object({
    acquirerId: uuidSchema.optional(),
    currentVersionId: uuidSchema.optional(),
    status: statusTypeSchema.optional(),
    nextVersionId: uuidSchema.nullable().optional(),
    deliveryDate: isoDateStringSchema.nullable().optional(),
    recommendedDeviceId: z.union([uuidSchema, z.null()]).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
    obs: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualizar",
  });

export type AcquirerStatusCreateInput = z.infer<
  typeof acquirerStatusCreateSchema
>;
export type AcquirerStatusUpdateInput = z.infer<
  typeof acquirerStatusUpdateSchema
>;
