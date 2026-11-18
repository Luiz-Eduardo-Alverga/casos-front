"use client";

import { useMemo } from "react";
import { useMensagens } from "@/hooks/mensagens/use-mensagens";
import { useJanelaConsultaAvisos } from "@/hooks/mensagens/use-janela-consulta-avisos";
import {
  filtrarAvisosAutomaticos,
  intervaloConsultaAvisosAutomaticos,
} from "@/lib/mensagens/avisos-automaticos";

/**
 * Fila de avisos automáticos não lidos dos últimos 7 dias, do mais antigo para o mais novo
 * (decisões #18, #20, #22 e #25 de docs/avisos). Com erro na consulta a fila fica vazia
 * (decisão #23: não bloqueia por falha de rede).
 */
export function useAvisosAutomaticos() {
  const { queryOptions } = useJanelaConsultaAvisos();
  // Calculado uma vez por montagem; a janela de 7 dias é reaplicada no front a cada resposta.
  const intervalo = useMemo(() => intervaloConsultaAvisosAutomaticos(), []);

  const query = useMensagens(
    { lido: false, ...intervalo },
    { ...queryOptions, retry: 1 },
  );

  const fila = useMemo(
    () => filtrarAvisosAutomaticos(query.data?.data ?? [], new Date()),
    [query.data?.data],
  );

  return { fila, isError: query.isError };
}
