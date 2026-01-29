import { assistant } from "@/services/ia/assistant";
import { useMutation } from "@tanstack/react-query";

export function useAssistant() {
    return useMutation({
        mutationFn: ({ description }: { description: string }) => assistant({ description }),
    });
}