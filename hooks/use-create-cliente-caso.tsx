"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createClienteCaso,
  type CreateClienteCasoRequest,
} from "@/services/projeto-casos-clientes/create";

export function useCreateClienteCaso() {
  return useMutation({
    mutationFn: (data: CreateClienteCasoRequest) => createClienteCaso(data),
  });
}
