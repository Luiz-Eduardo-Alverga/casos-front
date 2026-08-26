"use client";

import { useQuery } from "@tanstack/react-query";
import { getDocClient } from "@/services/db-api/docs";
import { isHttpError } from "@/lib/http-error";

export function useDoc(id?: string | null) {
  return useQuery({
    queryKey: ["doc", id],
    queryFn: () => getDocClient(id!),
    enabled: Boolean(id),
    retry: (_count, error) => !isHttpError(error) || error.status !== 404,
    refetchOnWindowFocus: false,
  });
}
