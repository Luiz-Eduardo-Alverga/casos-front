import type { DocStatus } from "@/services/db-api/docs";

export const DOC_STATUS_OPTIONS: Array<{
  value: DocStatus;
  label: string;
}> = [
  { value: "publicado", label: "Publicado" },
  { value: "rascunho", label: "Rascunho" },
  { value: "desatualizado", label: "Desatualizado" },
];

export const DOC_STATUS_LABELS = Object.fromEntries(
  DOC_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<DocStatus, string>;
