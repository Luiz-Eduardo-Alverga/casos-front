"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFormAssistantPrompt } from "@/services/ia/form-assistant-prompts";

export function useDeleteFormAssistantPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFormAssistantPrompt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-assistant-prompts"] });
      queryClient.invalidateQueries({
        queryKey: ["form-assistant-prompts", "default"],
      });
      queryClient.invalidateQueries({
        queryKey: ["form-assistant-prompts", "squad"],
      });
    },
  });
}
