"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateFormAssistantPromptRequest } from "@/lib/types/form-assistant-prompts";
import { updateFormAssistantPrompt } from "@/services/ia/form-assistant-prompts";

export function useUpdateFormAssistantPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      id: string;
      body: UpdateFormAssistantPromptRequest;
    }) => updateFormAssistantPrompt(params.id, params.body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["form-assistant-prompts"] });
      queryClient.invalidateQueries({
        queryKey: ["form-assistant-prompts", "default"],
      });
      if (data.squadSetor) {
        queryClient.invalidateQueries({
          queryKey: ["form-assistant-prompts", "squad", data.squadSetor],
        });
      }
    },
  });
}
