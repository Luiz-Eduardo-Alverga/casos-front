"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createDeviceClient,
  deleteDeviceClient,
  getDeviceByIdClient,
  updateDeviceClient,
  type CreateDeviceClientInput,
} from "@/services/db-api/create-cadastros";
import type { DeviceUpdateInput } from "@/lib/validators/db/devices";

export function useCreateDevice() {
  return useMutation({
    mutationFn: (data: CreateDeviceClientInput) => createDeviceClient(data),
  });
}

export function useUpdateDevice() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DeviceUpdateInput }) =>
      updateDeviceClient(id, input),
  });
}

export function useDeleteDevice() {
  return useMutation({
    mutationFn: (id: string) => deleteDeviceClient(id),
  });
}

export function useDeviceById() {
  return useMutation({
    mutationFn: (id: string) => getDeviceByIdClient(id),
  });
}
