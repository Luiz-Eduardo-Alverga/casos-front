"use client";

import { useQuery } from "@tanstack/react-query";
import { listDevicesClient } from "@/services/db-api/list-cadastros";

export function useDbDevices(params?: { search?: string; enabled?: boolean }) {
  const search = params?.search;
  const enabled = params?.enabled ?? true;

  return useQuery({
    queryKey: ["db-devices", search ?? ""],
    enabled,
    queryFn: () => listDevicesClient(search),
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

