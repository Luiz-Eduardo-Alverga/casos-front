import { assistant } from "@/services/ia/assistant";
import { useMutation } from "@tanstack/react-query";

interface AssistantParams {
    description?: string;
    audio?: Blob;
}

export function useAssistant() {
    return useMutation({
        mutationFn: ({ description, audio }: AssistantParams) => assistant({ description, audio }),
    });
}