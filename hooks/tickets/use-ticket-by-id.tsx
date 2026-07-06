"use client";

import { useQuery } from "@tanstack/react-query";
import { getTicketById } from "@/services/tickets/get-ticket-by-id";
import { isHttpError } from "@/lib/http-error";

export interface UseTicketByIdOptions {
  enabled?: boolean;
}

export function useTicketById(
  id: number | string | null | undefined,
  options?: UseTicketByIdOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = id != null && id !== "" && enabled;

  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicketById(id as number | string),
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (isHttpError(error) && error.status === 404) return false;
      return failureCount < 1;
    },
  });
}
