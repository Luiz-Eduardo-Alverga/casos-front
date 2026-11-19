import { z } from "zod";

export const autorizarFormSchema = z.object({
  senha: z.string().min(1, "Informe sua senha para conectar"),
});

export type AutorizarFormData = z.infer<typeof autorizarFormSchema>;
