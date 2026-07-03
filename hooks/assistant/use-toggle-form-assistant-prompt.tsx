"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFormAssistantPrompt } from "@/services/ia/form-assistant-prompts";

export function useToggleFormAssistantPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleFormAssistantPrompt(id),
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
