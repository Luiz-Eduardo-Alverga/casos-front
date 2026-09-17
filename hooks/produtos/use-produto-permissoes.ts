"use client";

import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

export function useProdutoPermissoes() {
  const rbacReady = permissionsLoaded();

  return {
    rbacReady,
    canList: !rbacReady || hasPermission("list-product"),
    canCreate: !rbacReady || hasPermission("create-product"),
    canEdit: !rbacReady || hasPermission("edit-product"),
    canDelete: !rbacReady || hasPermission("delete-product"),
  };
}
