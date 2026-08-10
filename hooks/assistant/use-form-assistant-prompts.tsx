"use client";

import { useQuery } from "@tanstack/react-query";
import type { PromptType } from "@/lib/types/form-assistant-prompts";
import { getFormAssistantPrompts } from "@/services/ia/form-assistant-prompts";

export function useFormAssistantPrompts(
  tipo: PromptType = "FORM_ASSISTANT",
) {
  return useQuery({
    queryKey: ["form-assistant-prompts", tipo],
    queryFn: () => getFormAssistantPrompts(tipo),
  });
}
