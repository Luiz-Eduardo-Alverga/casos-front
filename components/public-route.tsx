"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getSafeInternalReturnPath } from "@/lib/safe-callback-url";

interface PublicRouteProps {
  children: React.ReactNode;
  /** Query `callbackUrl` da página de login (rota interna segura após já autenticado). */
  callbackUrl?: string;
}

export function PublicRoute({ children, callbackUrl }: PublicRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const dest =
          getSafeInternalReturnPath(callbackUrl) ?? "/painel";
        router.push(dest);
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, callbackUrl]);

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
