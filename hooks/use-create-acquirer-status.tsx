"use client";

import { useMutation } from "@tanstack/react-query";
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

export function useAcquirerStatusById() {
  return useMutation({
    mutationFn: (id: string) => getAcquirerStatusByIdClient(id),
  });
}

export function useAcquirerCompatibleDevicesByStatus() {
  return useMutation({
    mutationFn: (statusId: string) => listAcquirerCompatibleDevicesClient(statusId),
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
