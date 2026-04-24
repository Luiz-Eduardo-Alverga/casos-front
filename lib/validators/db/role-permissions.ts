import { z } from "zod";
import { uuidSchema } from "@/lib/validators/db/shared";

const permissionIdsField = z
  .array(uuidSchema)
  .min(1, "Informe ao menos um permissionId")
  .max(500);

/**
 * Uma permissão: `{ permissionId }`.
 * Várias: `{ permissionIds: uuid[] }` (1–500, deduplicadas no servidor).
 * Não use os dois no mesmo corpo.
 */
export const rolePermissionLinkSchema = z
  .object({
    permissionId: uuidSchema.optional(),
    permissionIds: permissionIdsField.optional(),
  })
  .superRefine((val, ctx) => {
    const hasOne = val.permissionId !== undefined;
    const hasMany = val.permissionIds !== undefined;
    if (hasOne && hasMany) {
      ctx.addIssue({
        code: "custom",
        message: "Use apenas permissionId ou permissionIds, não ambos",
        path: ["permissionIds"],
      });
    } else if (!hasOne && !hasMany) {
      ctx.addIssue({
        code: "custom",
        message: "Informe permissionId ou permissionIds",
      });
    }
  });

export type RolePermissionLinkInput = z.infer<typeof rolePermissionLinkSchema>;

/**
 * PUT sync da matriz de permissões do papel: lista completa e final.
 * Array vazio remove todos os vínculos existentes.
 */
export const rolePermissionSyncSchema = z.object({
  permissionIds: z.array(uuidSchema).max(1000).default([]),
});

export type RolePermissionSyncInput = z.infer<typeof rolePermissionSyncSchema>;
