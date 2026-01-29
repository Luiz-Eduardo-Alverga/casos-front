"use client";

import { useMutation } from "@tanstack/react-query";
import { createCaso, CreateCasoRequest } from "@/services/projeto-casos/create";

export function useCreateCaso() {
  return useMutation({
    mutationFn: (data: CreateCasoRequest) => createCaso(data),
  });
}
