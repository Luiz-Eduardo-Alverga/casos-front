"use client";

import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

export function useMelhoriaPermissoes() {
  const rbacReady = permissionsLoaded();

  return {
    rbacReady,
    canList: !rbacReady || hasPermission("list-improvement"),
    canEdit: !rbacReady || hasPermission("edit-improvement"),
  };
}
