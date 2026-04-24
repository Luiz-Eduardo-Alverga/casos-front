"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRoleClient,
  updateRoleClient,
} from "@/services/db-api/rbac";
import type {
  RoleCreateInput,
  RoleUpdateInput,
} from "@/lib/validators/db/roles";

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RoleCreateInput) => createRoleClient(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["db-roles"] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RoleUpdateInput }) =>
      updateRoleClient(id, input),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["db-roles"] });
      queryClient.invalidateQueries({ queryKey: ["db-role", vars.id] });
    },
  });
}
