import { z } from "zod";

/** Payload do usuário retornado por `/auth/login` e `GET /auth/me` (Soft Flow). */
export const legacyUserSchema = z.object({
  id: z.number().int(),
  nome: z.string().min(1),
  usuario: z.string().min(1),
  usuario_grupo_id: z.string(),
  setor: z.string(),
});

export type LegacyUserInput = z.infer<typeof legacyUserSchema>;
