import { z } from "zod";

export const docFormSchema = z.object({
  title: z.string().trim().min(3, "Informe ao menos 3 caracteres").max(200),
  summary: z.string().max(400).default(""),
  contentMd: z.string().default(""),
  categoryId: z.string().uuid("Selecione uma categoria"),
  status: z.enum(["rascunho", "publicado", "desatualizado"]),
  sector: z.string().optional(),
  ownerUserId: z.string().optional(),
  ownerLegacyUserId: z.string().optional(),
  reviewDueAt: z.string().optional(),
  tags: z.array(z.string()).max(20),
  links: z.array(
    z.object({
      entityType: z.enum(["acquirer", "product", "client", "case"]),
      entityId: z.string().min(1),
      entityLabel: z.string().min(1),
    }),
  ),
});

export type DocFormValues = z.infer<typeof docFormSchema>;
