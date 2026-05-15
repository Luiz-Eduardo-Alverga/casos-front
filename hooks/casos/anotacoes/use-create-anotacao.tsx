"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createAnotacao,
  type CreateAnotacaoRequest,
} from "@/services/projeto-casos-anotacoes/create";

export function useCreateAnotacao() {
  return useMutation({
    mutationFn: (data: CreateAnotacaoRequest) => createAnotacao(data),
  });
}
