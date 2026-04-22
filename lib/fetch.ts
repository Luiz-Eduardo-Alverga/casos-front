import { clearAuthData } from "@/lib/auth";

function loginHrefPreservingCurrentUrl(): string {
  if (typeof window === "undefined") return "/login";
  const fullPath = `${window.location.pathname}${window.location.search}`;
  return fullPath
    ? `/login?callbackUrl=${encodeURIComponent(fullPath)}`
    : "/login";
}

/**
 * Tenta renovar o token via endpoint de refresh (cookie é enviado automaticamente).
 * O servidor atualiza o cookie e retorna sucesso; o cliente apenas repete a requisição.
 */
async function tryRefreshToken(): Promise<boolean> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) return false;
  const data = await response.json().catch(() => ({}));
  return data?.success === true;
}

/**
 * Wrapper para fetch que trata automaticamente erros 401 (sessão inválida/expirada).
 * Em 401: tenta refresh uma vez (cookie é enviado e atualizado no servidor), repete a requisição;
 * se refresh falhar ou a nova requisição ainda retornar 401, limpa auth, chama logout e redireciona para /login.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const options: RequestInit = {
    ...init,
    credentials: init?.credentials ?? "include",
  };

  let response = await fetch(input, options);

  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      response = await fetch(input, options);
    }
    if (response.status === 401) {
      clearAuthData();
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (typeof window !== "undefined") {
        window.location.href = loginHrefPreservingCurrentUrl();
      }
    }
  }

  return response;
}
