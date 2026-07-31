import { useMutation } from "@tanstack/react-query";
import { getReleaseNotes } from "@/services/ia/release-notes";

export function useGenerateReleaseNotes() {
  return useMutation({
    mutationFn: (liberacaoId: number | string) => getReleaseNotes(liberacaoId),
  });
}
