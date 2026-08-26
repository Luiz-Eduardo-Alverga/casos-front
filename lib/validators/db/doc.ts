import { z } from "zod";
import { isoDateStringSchema, uuidSchema } from "@/lib/validators/db/shared";

export const DOC_STATUS_VALUES = [
  "rascunho",
  "publicado",
  "desatualizado",
] as const;

export const DOC_LINK_TYPE_VALUES = [
  "acquirer",
  "product",
  "client",
  "case",
] as const;

export const docStatusSchema = z.enum(DOC_STATUS_VALUES);
export const docLinkTypeSchema = z.enum(DOC_LINK_TYPE_VALUES);

export const docLinkInputSchema = z.object({
  entityType: docLinkTypeSchema,
  entityId: z.string().trim().min(1).max(200),
  entityLabel: z.string().trim().min(1).max(300),
});

export const createDocSchema = z.object({
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().max(400).optional(),
  contentMd: z.string().default(""),
  categoryId: uuidSchema,
  status: docStatusSchema.default("rascunho"),
  sector: z.string().trim().max(150).optional(),
  ownerUserId: uuidSchema.optional(),
  reviewDueAt: isoDateStringSchema.optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
  links: z.array(docLinkInputSchema).max(50).optional(),
});

export const updateDocSchema = createDocSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const listDocsQuerySchema = z
  .object({
    search: z.string().trim().max(200).optional(),
    categoryId: uuidSchema.optional(),
    status: docStatusSchema.optional(),
    sector: z.string().trim().max(150).optional(),
    tag: z.string().trim().max(100).optional(),
    entityType: docLinkTypeSchema.optional(),
    entityId: z.string().trim().max(200).optional(),
    cursor: z.string().trim().max(500).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .refine(
    (value) =>
      (value.entityType == null && value.entityId == null) ||
      (value.entityType != null && Boolean(value.entityId)),
    {
      message: "entityType e entityId devem ser informados juntos",
      path: ["entityId"],
    },
  );

export const createDocCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido"),
  sortOrder: z.number().int().min(0).optional(),
});

export const searchDocTagsQuerySchema = z.object({
  search: z.string().trim().max(100).default(""),
});

export type CreateDocInput = z.infer<typeof createDocSchema>;
export type UpdateDocInput = z.infer<typeof updateDocSchema>;
export type ListDocsQuery = z.infer<typeof listDocsQuerySchema>;
export type DocLinkInput = z.infer<typeof docLinkInputSchema>;
export type CreateDocCategoryInput = z.infer<
  typeof createDocCategorySchema
>;
