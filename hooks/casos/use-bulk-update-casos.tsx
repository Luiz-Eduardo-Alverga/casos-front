"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bulkUpdateCasos,
  type BulkUpdateCasosRequest,
} from "@/services/projeto-casos/bulk-update";

export function useBulkUpdateCasos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: BulkUpdateCasosRequest) => bulkUpdateCasos(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
      queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
    },
  });
}
