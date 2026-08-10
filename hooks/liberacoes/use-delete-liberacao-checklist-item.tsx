"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLiberacaoChecklistItem } from "@/services/sprint/delete-liberacao-checklist-item";

export interface DeleteLiberacaoChecklistItemVariables {
  registro: number | string;
  itemId: number | string;
}

export function useDeleteLiberacaoChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ registro, itemId }: DeleteLiberacaoChecklistItemVariables) =>
      deleteLiberacaoChecklistItem(registro, itemId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["liberacoes", variables.registro, "checklist"],
      });
    },
  });
}
