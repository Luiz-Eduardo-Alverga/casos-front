"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  listAppUsersClient,
  listAppUsersInfiniteClient,
  replaceAppUserRoleClient,
} from "@/services/db-api/rbac";

const STALE_MS = 60_000;
const GC_MS = 5 * 60_000;
const USERS_PAGE_SIZE = 25;

export function useDbAppUsers(search?: string) {
  const trimmed = search?.trim() ?? "";
  return useQuery({
    queryKey: ["db-app-users", trimmed] as const,
    queryFn: () => listAppUsersClient(trimmed || undefined),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useDbAppUsersInfinite(search?: string) {
  const trimmed = search?.trim() ?? "";
  return useInfiniteQuery({
    queryKey: ["db-app-users", "infinite", trimmed] as const,
    initialPageParam: 0 as number,
    queryFn: ({ pageParam }) =>
      listAppUsersInfiniteClient({
        search: trimmed || undefined,
        cursor: pageParam,
        limit: USERS_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useReplaceAppUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      replaceAppUserRoleClient(userId, roleId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["db-app-users"] });
      queryClient.invalidateQueries({ queryKey: ["db-app-user", vars.userId] });
      queryClient.invalidateQueries({
        queryKey: ["db-app-user-roles", vars.userId],
      });
    },
  });
}

