"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createAcquirerClient,
  deleteAcquirerClient,
  getAcquirerByIdClient,
  updateAcquirerClient,
  type CreateAcquirerClientInput,
} from "@/services/db-api/create-cadastros";
import type { AcquirerUpdateInput } from "@/lib/validators/db/acquirers";

export function useCreateAcquirer() {
  return useMutation({
    mutationFn: (data: CreateAcquirerClientInput) => createAcquirerClient(data),
  });
}

export function useUpdateAcquirer() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcquirerUpdateInput }) =>
      updateAcquirerClient(id, input),
  });
}

export function useDeleteAcquirer() {
  return useMutation({
    mutationFn: (id: string) => deleteAcquirerClient(id),
  });
}

export function useAcquirerById() {
  return useMutation({
    mutationFn: (id: string) => getAcquirerByIdClient(id),
  });
}
