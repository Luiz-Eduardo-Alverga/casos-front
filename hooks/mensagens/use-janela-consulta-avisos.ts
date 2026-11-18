"use client";

import { useEffect, useState } from "react";

/** Intervalo de consulta dos avisos (sino e aviso automático). */
export const INTERVALO_CONSULTA_AVISOS_MS = 300_000;

function dentroDoHorario(data: Date): boolean {
  const hora = data.getHours();
  return hora >= 6 && hora <= 23;
}

/**
 * Regra única de polling dos avisos (decisão #22 de docs/avisos): consulta ao abrir o Softflow e
 * a cada 5 minutos, das 6h às 23h59. Devolve as opções de `useQuery` já prontas.
 */
export function useJanelaConsultaAvisos() {
  const [ativo, setAtivo] = useState(() => dentroDoHorario(new Date()));

  useEffect(() => {
    const id = window.setInterval(
      () => setAtivo(dentroDoHorario(new Date())),
      60_000,
    );
    return () => window.clearInterval(id);
  }, []);

  return {
    ativo,
    queryOptions: {
      enabled: ativo,
      refetchInterval: ativo ? INTERVALO_CONSULTA_AVISOS_MS : (false as const),
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  };
}
