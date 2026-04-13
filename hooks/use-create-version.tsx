"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createVersionClient,
  deleteVersionClient,
  getVersionByIdClient,
  updateVersionClient,
  type CreateVersionClientInput,
} from "@/services/db-api/create-cadastros";
import type { VersionUpdateInput } from "@/lib/validators/db/versions";

export function useCreateVersion() {
  return useMutation({
    mutationFn: (data: CreateVersionClientInput) => createVersionClient(data),
  });
}

export function useUpdateVersion() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VersionUpdateInput }) =>
      updateVersionClient(id, input),
  });
}

export function useDeleteVersion() {
  return useMutation({
    mutationFn: (id: string) => deleteVersionClient(id),
  });
}

export function useVersionById() {
  return useMutation({
    mutationFn: (id: string) => getVersionByIdClient(id),
  });
}
