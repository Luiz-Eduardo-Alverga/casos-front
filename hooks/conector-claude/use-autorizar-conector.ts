"use client";

import { useMutation } from "@tanstack/react-query";
import {
  autorizarConector,
  type AutorizarConectorInput,
} from "@/services/conector-claude/autorizar";

/** Envia "Permitir acesso" ou "Cancelar" da tela `/oauth/autorizar`. */
export function useAutorizarConector() {
  return useMutation({
    mutationFn: (input: AutorizarConectorInput) => autorizarConector(input),
  });
}
