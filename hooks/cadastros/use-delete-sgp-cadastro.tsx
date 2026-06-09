"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSgpCadastro } from "@/services/sgp-cadastros/delete-sgp-cadastro";

export function useDeleteSgpCadastro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteSgpCadastro(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["sgp-cadastros"] });
      queryClient.invalidateQueries({ queryKey: ["sgp-cadastro", id] });
    },
  });
}
