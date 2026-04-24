import { z } from "zod";
import { uuidSchema } from "@/lib/validators/db/shared";

export const userRoleLinkSchema = z.object({
  roleId: uuidSchema,
});

export type UserRoleLinkInput = z.infer<typeof userRoleLinkSchema>;
