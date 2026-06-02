import type { QueryClient } from "@tanstack/react-query";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { IniciarProducaoData } from "@/services/projeto-casos-producao/iniciar-producao";
import type { CasoAbertoAtivoResponse } from "@/services/projeto-casos-producao/get-caso-aberto-ativo";

export const casoAbertoAtivoQueryKey = ["caso-aberto-ativo"] as const;

export type CasoAbertoAtivoCache = CasoAbertoAtivoResponse;

function getPreviousCaso(
  queryClient: QueryClient,
  registro: number,
): ProjetoMemoriaItem | null | undefined {
  const previous = queryClient.getQueryData<CasoAbertoAtivoCache>(
    casoAbertoAtivoQueryKey,
  );
  if (previous?.caso?.caso?.id === registro) {
    return previous.caso;
  }
  return null;
}

export function syncCasoAbertoAtivoAfterIniciar(
  queryClient: QueryClient,
  data: IniciarProducaoData,
) {
  if (!data.em_andamento) {
    queryClient.setQueryData<CasoAbertoAtivoCache>(casoAbertoAtivoQueryKey, {
      hasCasoAberto: false,
    });
    return;
  }

  const previousCaso = getPreviousCaso(queryClient, data.registro);

  queryClient.setQueryData<CasoAbertoAtivoCache>(casoAbertoAtivoQueryKey, {
    hasCasoAberto: true,
    producao: data,
    caso: previousCaso ?? null,
  });
}

export function syncCasoAbertoAtivoAfterParar(queryClient: QueryClient) {
  queryClient.setQueryData<CasoAbertoAtivoCache>(casoAbertoAtivoQueryKey, {
    hasCasoAberto: false,
  });
}

export function invalidateCasoAbertoAtivo(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: casoAbertoAtivoQueryKey });
}

export function invalidateProjetoMemoriaForRegistro(
  queryClient: QueryClient,
  registro: number | string,
) {
  void queryClient.invalidateQueries({
    queryKey: ["projeto-memoria", String(registro)],
  });
  void queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
}
