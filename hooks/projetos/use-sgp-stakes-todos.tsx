"use client";

import { useQuery } from "@tanstack/react-query";
import { getSgpStakesByProjeto } from "@/services/sgp-stakes/get-sgp-stakes-by-projeto";
import { sgpStakesQueryKeys } from "@/hooks/projetos/sgp-projeto-query-keys";
import type { SgpStakeItem } from "@/interfaces/sgp-stake";

/** Páginas de 100: a API aceita `per_page` alto, mas o teto não foi visto (Fase 0 da aba Stakes). */
const PER_PAGE = 100;
/** Proteção contra cursor que não avança. */
const MAX_PAGINAS = 50;

/** Busca todas as páginas de `GET /sgp-stakes/projeto/{registro}` em sequência. */
export async function getTodosSgpStakesByProjeto(
  projetoId: number | string,
): Promise<SgpStakeItem[]> {
  const itens: SgpStakeItem[] = [];
  let cursor: string | null = null;

  for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
    const response = await getSgpStakesByProjeto({
      projetoId,
      per_page: PER_PAGE,
      cursor,
    });
    itens.push(...(response.data ?? []));
    const { has_more, next_cursor } = response.pagination ?? {};
    if (!has_more || !next_cursor || next_cursor === cursor) break;
    cursor = next_cursor;
  }

  return itens;
}

export interface UseSgpStakesTodosOptions {
  enabled?: boolean;
}

/** Todos os stakeholders do projeto (lista editável e origem do Importar). */
export function useSgpStakesTodos(
  projetoId: number | string | null | undefined,
  options?: UseSgpStakesTodosOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = projetoId != null && projetoId !== "" && enabled;

  return useQuery({
    queryKey: sgpStakesQueryKeys.todos(projetoId as number | string),
    queryFn: () => getTodosSgpStakesByProjeto(projetoId as number | string),
    enabled: shouldFetch,
  });
}
