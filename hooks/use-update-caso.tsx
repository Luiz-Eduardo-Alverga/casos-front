"use client";

import { useMutation } from "@tanstack/react-query";
import {
  updateCaso,
  type UpdateCasoRequest,
} from "@/services/projeto-casos/update";

/**
 * @param caseScopeId Quando informado, associa a mutation a este caso (mutationKey),
 *   permitindo rastrear `useIsMutating({ mutationKey: ['update-caso', id] })` na edição.
 */
export function useUpdateCaso(caseScopeId?: string | number | null) {
  const mutationKey =
    caseScopeId != null && String(caseScopeId) !== ""
      ? (["update-caso", String(caseScopeId)] as const)
      : undefined;

  return useMutation({
    ...(mutationKey ? { mutationKey: [...mutationKey] } : {}),
    mutationFn: ({ id, data }: { id: number | string; data: UpdateCasoRequest }) =>
      updateCaso(id, data),
  });
}
