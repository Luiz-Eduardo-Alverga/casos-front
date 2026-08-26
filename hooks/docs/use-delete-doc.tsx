"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteDocClient } from "@/services/db-api/docs";

export function useDeleteDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDocClient,
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ["docs"] });
      queryClient.removeQueries({ queryKey: ["doc", id] });
      toast.success("Documento excluído com sucesso");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir documento",
      );
    },
  });
}
