"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  hasAnyPermission,
  hasPermission,
  permissionsLoaded,
  type PermissionCode,
} from "@/lib/rbac-client";

interface RequirePermissionProps {
  permission: PermissionCode | PermissionCode[];
  redirectTo?: string;
  toastMessage?: string;
  children: React.ReactNode;
}

export function RequirePermission({
  permission,
  redirectTo = "/painel",
  toastMessage = "Sem permissão para acessar esta página.",
  children,
}: RequirePermissionProps) {
  const router = useRouter();

  const allowed = useMemo(() => {
    if (!permissionsLoaded()) return true; // evita bloquear enquanto está sincronizando
    return Array.isArray(permission)
      ? hasAnyPermission(permission)
      : hasPermission(permission);
  }, [permission]);

  useEffect(() => {
    if (!permissionsLoaded()) return;
    if (allowed) return;
    toast.error(toastMessage);
    router.push(redirectTo);
  }, [allowed, redirectTo, router, toastMessage]);

  if (!allowed && permissionsLoaded()) return null;
  return <>{children}</>;
}
