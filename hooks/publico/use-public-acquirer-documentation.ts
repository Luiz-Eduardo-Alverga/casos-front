"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicAcquirerDocumentation } from "@/services/public-api/get-acquirer-documentation";

export function usePublicAcquirerDocumentation(opaqueAcquirerId: string | null) {
  return useQuery({
    queryKey: ["public-acquirer-documentation", opaqueAcquirerId],
    queryFn: () => getPublicAcquirerDocumentation(opaqueAcquirerId!),
    enabled: Boolean(opaqueAcquirerId),
    refetchOnWindowFocus: false,
  });
}
