"use client";

import { useQuery } from "@tanstack/react-query";
import { getSgpObjetivos } from "@/services/auxiliar/sgp-objetivos";

export interface UseSgpObjetivosParams {
  search?: string;
  enabled?: boolean;
}

export function useSgpObjetivos(params?: UseSgpObjetivosParams) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: ["sgp-objetivos", params?.search ?? ""],
    queryFn: () => getSgpObjetivos({ search: params?.search }),
    enabled,
  });
}
