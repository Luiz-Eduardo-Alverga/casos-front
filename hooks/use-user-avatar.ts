"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateAppUserInAuth } from "@/lib/auth";
import {
  deleteUserAvatar,
  fetchUserAvatarUrl,
  uploadUserAvatarFull,
} from "@/services/db-api/user-avatar";

export const userAvatarQueryKey = ["user-avatar"] as const;

export function useUserAvatarUrl(enabled = true) {
  return useQuery({
    queryKey: userAvatarQueryKey,
    enabled,
    queryFn: fetchUserAvatarUrl,
    staleTime: 4 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUploadUserAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadUserAvatarFull,
    onSuccess: (data) => {
      updateAppUserInAuth(data.appUser);
      qc.setQueryData(userAvatarQueryKey, {
        avatarUrl: data.avatarUrl,
        avatarPath: data.appUser.avatarPath ?? null,
        avatarUpdatedAt: data.appUser.avatarUpdatedAt ?? null,
      });
    },
  });
}

export function useDeleteUserAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUserAvatar,
    onSuccess: (data) => {
      updateAppUserInAuth(data.appUser);
      qc.setQueryData(userAvatarQueryKey, {
        avatarUrl: null,
        avatarPath: null,
        avatarUpdatedAt: null,
      });
    },
  });
}
