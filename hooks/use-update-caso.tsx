"use client";

import { useMutation } from "@tanstack/react-query";
import {
  updateCaso,
  type UpdateCasoRequest,
} from "@/services/projeto-casos/update";

export function useUpdateCaso() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: UpdateCasoRequest }) =>
      updateCaso(id, data),
  });
}
