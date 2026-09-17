import { z } from "zod";
import { PRODUTO_LABELS } from "@/components/produtos/constants";

export const checklistItemSchema = z.object({
  descricao: z.string().trim().min(1, PRODUTO_LABELS.descrevaItemChecklist),
  responsavelId: z.string().optional(),
});

export type ChecklistItemFormData = z.infer<typeof checklistItemSchema>;

export function getChecklistItemDefaultValues(
  values?: Partial<ChecklistItemFormData>,
): ChecklistItemFormData {
  return {
    descricao: values?.descricao ?? "",
    responsavelId: values?.responsavelId ?? "",
  };
}
