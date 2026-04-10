import { z } from "zod";
import { uuidSchema } from "./shared";

/** POST aninhado em `/acquirer-status/:id/compatible-devices` (o `statusId` vem da URL). */
export const compatibleDeviceCreateSchema = z.object({
  deviceId: uuidSchema,
  androidVersion: z.string().nullable().optional(),
});

/** POST em `/acquirer-compatible-devices` (status e dispositivo no corpo). */
export const compatibleDeviceLinkBodySchema = z.object({
  statusId: uuidSchema,
  deviceId: uuidSchema,
  androidVersion: z.string().nullable().optional(),
});

export type CompatibleDeviceCreateInput = z.infer<
  typeof compatibleDeviceCreateSchema
>;
export type CompatibleDeviceLinkBodyInput = z.infer<
  typeof compatibleDeviceLinkBodySchema
>;
