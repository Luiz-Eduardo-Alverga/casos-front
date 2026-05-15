"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAcquirerByIdClient,
  getDeviceByIdClient,
  getVersionByIdClient,
} from "@/services/db-api/create-cadastros";

const STALE_MS = 60_000;
const GC_MS = 5 * 60_000;

/**
 * Detalhe de adquirente para edição — cache por id (PADRAO_REQUISICOES: useQuery + service).
 * Reabra o mesmo registro: dados vêm do cache se ainda frescos (`staleTime`).
 */
export function useAcquirerDetailQuery(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["db-acquirer", id] as const,
    queryFn: () => getAcquirerByIdClient(id!),
    enabled: Boolean(id) && enabled,
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useDeviceDetailQuery(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["db-device", id] as const,
    queryFn: () => getDeviceByIdClient(id!),
    enabled: Boolean(id) && enabled,
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useVersionDetailQuery(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["db-version", id] as const,
    queryFn: () => getVersionByIdClient(id!),
    enabled: Boolean(id) && enabled,
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
