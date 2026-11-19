"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuthData } from "@/lib/auth";

/**
 * Sem sessão válida no servidor: limpa os dados locais (senão o `PublicRoute` do login
 * devolveria a pessoa para cá em loop) e vai ao login, que volta para esta tela.
 */
export function AutorizarSemSessao({ loginHref }: { loginHref: string }) {
  const router = useRouter();

  useEffect(() => {
    clearAuthData();
    router.replace(loginHref);
  }, [loginHref, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
