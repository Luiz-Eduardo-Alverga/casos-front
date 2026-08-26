"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createDocClient,
  type DocWriteInput,
} from "@/services/db-api/docs";

export function useCreateDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DocWriteInput) => createDocClient(input),
    onSuccess: (doc) => {
      void queryClient.invalidateQueries({ queryKey: ["docs"] });
      queryClient.setQueryData(["doc", doc.id], doc);
      toast.success("Documento criado com sucesso");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar documento",
      );
    },
  });
}
