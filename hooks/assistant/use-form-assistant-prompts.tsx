"use client";

import { useQuery } from "@tanstack/react-query";
import { getFormAssistantPrompts } from "@/services/ia/form-assistant-prompts";

export function useFormAssistantPrompts() {
  return useQuery({
    queryKey: ["form-assistant-prompts"],
    queryFn: getFormAssistantPrompts,
  });
}
