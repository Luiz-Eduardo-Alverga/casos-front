import type { DocWriteInput } from "@/services/db-api/docs";
import type { DocFormValues } from "../schema";

export function buildDocPayload(
  values: DocFormValues,
  sectorName?: string,
): DocWriteInput {
  return {
    title: values.title.trim(),
    summary: values.summary.trim() || undefined,
    contentMd: values.contentMd,
    categoryId: values.categoryId,
    status: values.status,
    sector: sectorName || undefined,
    ownerUserId: values.ownerUserId || undefined,
    reviewDueAt: values.reviewDueAt || null,
    tags: values.tags,
    links: values.links,
  };
}
