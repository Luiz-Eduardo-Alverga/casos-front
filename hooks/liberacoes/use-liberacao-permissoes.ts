"use client";

import {
  hasAnyPermission,
  hasPermission,
  permissionsLoaded,
} from "@/lib/rbac-client";

export function useLiberacaoPermissoes() {
  const rbacReady = permissionsLoaded();

  return {
    rbacReady,
    canList: !rbacReady || hasPermission("list-release"),
    canCreate: !rbacReady || hasPermission("create-release"),
    canEdit: !rbacReady || hasPermission("edit-release"),
    canDelete: !rbacReady || hasPermission("delete-release"),
    canEditCaso:
      !rbacReady || hasAnyPermission(["edit-case", "edit-report"]),
  };
}
