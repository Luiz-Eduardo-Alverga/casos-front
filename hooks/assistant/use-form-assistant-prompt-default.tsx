"use client";

import { useQuery } from "@tanstack/react-query";
import type { PromptType } from "@/lib/types/form-assistant-prompts";
import { getFormAssistantPromptDefault } from "@/services/ia/form-assistant-prompts";

export function useFormAssistantPromptDefault(
  tipo: PromptType = "FORM_ASSISTANT",
) {
  return useQuery({
    queryKey: ["form-assistant-prompts", "default", tipo],
    queryFn: () => getFormAssistantPromptDefault(tipo),
  });
}
