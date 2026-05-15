"use client";

import { useMutation } from "@tanstack/react-query";
import {
  finalizarCaso,
  type FinalizarCasoResponse,
} from "@/services/projeto-casos/finalizar-caso";

/**
 * @param caseScopeId Quando informado, associa a mutation a este caso (mutationKey),
 *   permitindo rastrear `useIsMutating({ mutationKey: ['finalizar-caso', id] })`.
 */
export function useFinalizarCaso(caseScopeId?: string | number | null) {
  const mutationKey =
    caseScopeId != null && String(caseScopeId) !== ""
      ? (["finalizar-caso", String(caseScopeId)] as const)
      : undefined;

  return useMutation({
    ...(mutationKey ? { mutationKey: [...mutationKey] } : {}),
    mutationFn: (registro: number | string) => finalizarCaso(registro),
  });
}

export type { FinalizarCasoResponse };
