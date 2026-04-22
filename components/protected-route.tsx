"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPermissions,
  getUser,
  isAuthenticated,
  saveAuthData,
} from "@/lib/auth";
import { syncAppUserClient } from "@/services/db-api/sync-app-user";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      if (!isAuthenticated()) {
        const fullPath =
          typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : "";
        router.push(
          fullPath
            ? `/login?callbackUrl=${encodeURIComponent(fullPath)}`
            : "/login"
        );
        return;
      }

      if (getPermissions() === null) {
        try {
          const synced = await syncAppUserClient();
          if (!cancelled && synced) {
            const user = getUser();
            if (user) {
              saveAuthData({
                user,
                permissions: synced.permissions,
                appUser: synced.appUser,
              });
            }
          }
        } catch {
          // Mantém sessão; permissões podem ficar vazias até novo login.
        }
      }

      if (!cancelled) setIsLoading(false);
    }

    void checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
