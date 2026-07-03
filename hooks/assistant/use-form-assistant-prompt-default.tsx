"use client";

import { useQuery } from "@tanstack/react-query";
import { getFormAssistantPromptDefault } from "@/services/ia/form-assistant-prompts";

export function useFormAssistantPromptDefault() {
  return useQuery({
    queryKey: ["form-assistant-prompts", "default"],
    queryFn: getFormAssistantPromptDefault,
  });
}
