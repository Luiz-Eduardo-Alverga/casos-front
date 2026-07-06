"use client";

import { useQuery } from "@tanstack/react-query";
import { getSelectableFormAssistantPrompts } from "@/services/ia/form-assistant-prompts";

interface UseSelectableAssistantPromptsOptions {
  enabled?: boolean;
}

export function useSelectableAssistantPrompts(
  options?: UseSelectableAssistantPromptsOptions,
) {
  return useQuery({
    queryKey: ["form-assistant-prompts", "selectable"],
    queryFn: getSelectableFormAssistantPrompts,
    enabled: options?.enabled ?? true,
  });
}
