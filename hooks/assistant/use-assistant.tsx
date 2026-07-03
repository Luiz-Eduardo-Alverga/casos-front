import { assistant } from "@/services/ia/assistant";
import { useMutation } from "@tanstack/react-query";

interface AssistantParams {
  description?: string;
  audio?: Blob;
  squadSetor?: string | null;
}

export function useAssistant() {
  return useMutation({
    mutationFn: ({ description, audio, squadSetor }: AssistantParams) =>
      assistant({ description, audio, squadSetor }),
  });
}
