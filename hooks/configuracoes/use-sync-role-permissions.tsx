"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncRolePermissionsClient } from "@/services/db-api/rbac";

/**
 * Sincroniza a matriz de permissões do papel: recebe a lista final de `permissionIds`
 * e o backend insere/remove em transação. Invalida a listagem (para atualizar
 * `permissionsCount`) e o detalhe do papel (para refletir a nova matriz).
 */
export function useSyncRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => syncRolePermissionsClient(roleId, permissionIds),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["db-roles"] });
      queryClient.invalidateQueries({
        queryKey: ["db-role-permissions", vars.roleId],
      });
    },
  });
}
