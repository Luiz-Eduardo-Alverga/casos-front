"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateFormAssistantPromptRequest } from "@/lib/types/form-assistant-prompts";
import { createFormAssistantPrompt } from "@/services/ia/form-assistant-prompts";

export function useCreateFormAssistantPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateFormAssistantPromptRequest) =>
      createFormAssistantPrompt(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["form-assistant-prompts"] });
      if (data.squadSetor) {
        queryClient.invalidateQueries({
          queryKey: ["form-assistant-prompts", "squad", data.squadSetor],
        });
      }
    },
  });
}
