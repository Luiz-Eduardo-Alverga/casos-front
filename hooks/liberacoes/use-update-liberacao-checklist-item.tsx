"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateLiberacaoChecklistItem,
  type UpdateLiberacaoChecklistItemRequest,
} from "@/services/sprint/update-liberacao-checklist-item";

export interface UpdateLiberacaoChecklistItemVariables {
  registro: number | string;
  itemId: number | string;
  data: UpdateLiberacaoChecklistItemRequest;
}

export function useUpdateLiberacaoChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      registro,
      itemId,
      data,
    }: UpdateLiberacaoChecklistItemVariables) =>
      updateLiberacaoChecklistItem(registro, itemId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["liberacoes", variables.registro, "checklist"],
      });
    },
  });
}
