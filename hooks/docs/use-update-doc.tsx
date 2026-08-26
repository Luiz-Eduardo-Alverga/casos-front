"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  updateDocClient,
  type DocUpdateInput,
} from "@/services/db-api/docs";

export function useUpdateDoc(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DocUpdateInput) => updateDocClient(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["docs"] });
      void queryClient.invalidateQueries({ queryKey: ["doc", id] });
      toast.success("Documento atualizado com sucesso");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar documento",
      );
    },
  });
}
