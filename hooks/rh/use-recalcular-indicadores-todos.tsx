"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateIndicadorBaseline } from "@/services/rh/update-indicador-baseline";
import type { ColaboradorIndicador } from "@/services/rh/get-colaboradores-indicadores";
import type {
  RecalcularIndicadoresTodosContexto,
  RecalcularTodosLinha,
} from "@/components/indicadores/types";

function toLinha(item: ColaboradorIndicador): RecalcularTodosLinha {
  return {
    id: item.id,
    nomes: item.nomes,
    area: item.elementos_da_cultura,
    unidade: item.unidade,
    status: "fila",
  };
}

function patchLinha(
  linhas: RecalcularTodosLinha[],
  id: number,
  patch: Partial<RecalcularTodosLinha>,
) {
  return linhas.map((linha) =>
    linha.id === id ? { ...linha, ...patch } : linha,
  );
}

export function useRecalcularIndicadoresTodos() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [linhas, setLinhas] = useState<RecalcularTodosLinha[]>([]);
  const runningRef = useRef(false);

  const start = useCallback(
    async (
      items: ColaboradorIndicador[],
      contexto: RecalcularIndicadoresTodosContexto,
    ) => {
      if (runningRef.current || items.length === 0) return;

      runningRef.current = true;
      setOpen(true);
      setRunning(true);
      setLinhas(items.map(toLinha));

      try {
        for (const item of items) {
          setLinhas((current) =>
            patchLinha(current, item.id, { status: "agora" }),
          );

          try {
            const response = await updateIndicadorBaseline({
              id: item.id,
              indicador_id: item.indicador_id,
              pilha: false,
              suporte_id: contexto.suporte_id,
              data_inicial: contexto.data_inicial,
              data_final: contexto.data_final,
              pdv: item.pdv,
              setor: item.setor,
            });

            setLinhas((current) =>
              patchLinha(current, item.id, {
                status: "concluido",
                valorIndicador: response.data.valor_indicador,
              }),
            );
          } catch (error) {
            setLinhas((current) =>
              patchLinha(current, item.id, {
                status: "erro",
                erroMensagem:
                  error instanceof Error
                    ? error.message
                    : "Erro ao recalcular indicador",
              }),
            );
          }
        }

        await queryClient.invalidateQueries({
          queryKey: ["colaboradores-indicadores"],
        });
      } finally {
        setRunning(false);
        runningRef.current = false;
      }
    },
    [queryClient],
  );

  const close = useCallback(() => {
    if (runningRef.current) return;
    setOpen(false);
  }, []);

  return { open, running, linhas, start, close };
}
