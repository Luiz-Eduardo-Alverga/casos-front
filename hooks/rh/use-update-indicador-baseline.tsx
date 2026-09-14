"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateIndicadorBaseline,
  type UpdateIndicadorBaselineData,
  type UpdateIndicadorBaselineRequest,
  type UpdateIndicadorBaselineResponse,
} from "@/services/rh/update-indicador-baseline";

export function useUpdateIndicadorBaseline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateIndicadorBaselineRequest) =>
      updateIndicadorBaseline(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colaboradores-indicadores"] });
    },
  });
}

export type {
  UpdateIndicadorBaselineData,
  UpdateIndicadorBaselineRequest,
  UpdateIndicadorBaselineResponse,
};
