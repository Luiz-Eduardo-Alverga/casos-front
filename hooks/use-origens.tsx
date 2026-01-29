"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrigens } from "@/services/auxiliar/origens";

export function useOrigens(params?: {
  search?: string;
}) {
  const hasSearch = params?.search && params.search.trim().length > 0;
  
  return useQuery({
    queryKey: ["origens", params?.search ?? ""],
    queryFn: () => getOrigens(params), 
  });
}
