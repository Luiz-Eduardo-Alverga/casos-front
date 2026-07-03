"use client";

import { useQuery } from "@tanstack/react-query";
import { getFormAssistantPromptBySquad } from "@/services/ia/form-assistant-prompts";

export function useFormAssistantPromptBySquad(setor?: string) {
  return useQuery({
    queryKey: ["form-assistant-prompts", "squad", setor ?? ""],
    enabled: Boolean(setor),
    queryFn: () => getFormAssistantPromptBySquad(setor!),
  });
}
