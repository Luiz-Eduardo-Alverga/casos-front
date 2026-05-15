"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAcquirerStatusClient,
  getAcquirerStatusByIdClient,
  listAcquirerCompatibleDevicesClient,
  updateAcquirerStatusClient,
  linkAcquirerCompatibleDeviceClient,
  unlinkAcquirerCompatibleDeviceClient,
} from "@/services/db-api/create-cadastros";
import type {
  AcquirerStatusCreateInput,
  AcquirerStatusUpdateInput,
} from "@/lib/validators/db/acquirer-status";

export function useCreateAcquirerStatus() {
  return useMutation({
    mutationFn: (input: AcquirerStatusCreateInput) =>
      createAcquirerStatusClient(input),
  });
}

export function useUpdateAcquirerStatus() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcquirerStatusUpdateInput }) =>
      updateAcquirerStatusClient(id, input),
  });
}

export function useAcquirerStatusById(params?: { id?: string | null; enabled?: boolean }) {
  const id = params?.id ?? null;
  const enabled = params?.enabled ?? Boolean(id);

  return useQuery({
    queryKey: ["db-acquirer-status", id ?? ""],
    enabled: Boolean(id) && enabled,
    queryFn: () => getAcquirerStatusByIdClient(id!),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAcquirerCompatibleDevicesByStatus(params?: {
  statusId?: string | null;
  enabled?: boolean;
}) {
  const statusId = params?.statusId ?? null;
  const enabled = params?.enabled ?? Boolean(statusId);

  return useQuery({
    queryKey: ["db-acquirer-compatible-devices", statusId ?? ""],
    enabled: Boolean(statusId) && enabled,
    queryFn: () => listAcquirerCompatibleDevicesClient(statusId!),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useLinkAcquirerCompatibleDevice() {
  return useMutation({
    mutationFn: (input: {
      statusId: string;
      deviceId: string;
      androidVersion?: string | null;
    }) => linkAcquirerCompatibleDeviceClient(input),
  });
}

export function useUnlinkAcquirerCompatibleDevice() {
  return useMutation({
    mutationFn: ({ statusId, deviceId }: { statusId: string; deviceId: string }) =>
      unlinkAcquirerCompatibleDeviceClient(statusId, deviceId),
  });
}
