"use client";

import { usePublicCadastroList } from "@/hooks/use-public-cadastro-list";
import {
  listPublicAcquirersClient,
  type PublicAcquirerListItem,
} from "@/services/public-api/list-acquirers";

export function usePublicAcquirersList(initialSearch: string, initialStatus: string) {
  return usePublicCadastroList<PublicAcquirerListItem>({
    queryKeyPrefix: "public-acquirers",
    queryKeyExtra: "expand-status",
    initialSearch,
    statusFilter: { initial: initialStatus },
    fetcher: (search, opts) =>
      listPublicAcquirersClient({
        search,
        status: opts?.status,
      }),
  });
}

