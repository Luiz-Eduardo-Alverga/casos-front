"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAppUser, updateAppUserInAuth } from "@/lib/auth";
import {
  fetchNotificacaoDiscord,
  patchNotificacaoDiscord,
} from "@/services/db-api/notificacao-discord";

export const notificacaoDiscordQueryKey = ["notificacao-discord"] as const;

export function useNotificacaoDiscord(enabled = true) {
  return useQuery({
    queryKey: notificacaoDiscordQueryKey,
    enabled,
    queryFn: ({ signal }) => fetchNotificacaoDiscord(signal),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: () => ({
      receberNotificacaoDiscord:
        getAppUser()?.receberNotificacaoDiscord ?? true,
    }),
  });
}

export function usePatchNotificacaoDiscord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patchNotificacaoDiscord,
    onMutate: async (checked) => {
      await qc.cancelQueries({ queryKey: notificacaoDiscordQueryKey });
      const previous = qc.getQueryData<{
        receberNotificacaoDiscord: boolean;
      }>(notificacaoDiscordQueryKey);
      qc.setQueryData(notificacaoDiscordQueryKey, {
        receberNotificacaoDiscord: checked,
      });
      return { previous };
    },
    onError: (_error, _checked, context) => {
      if (context?.previous) {
        qc.setQueryData(notificacaoDiscordQueryKey, context.previous);
      }
    },
    onSuccess: (data) => {
      updateAppUserInAuth(data.appUser);
      qc.setQueryData(notificacaoDiscordQueryKey, {
        receberNotificacaoDiscord: data.receberNotificacaoDiscord,
      });
    },
  });
}
