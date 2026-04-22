import type { AppUserSummary } from "@/lib/auth";

interface LoginParams {
  usuario: string;
  senha: string;
}

/** Resposta do login: token fica em cookie HttpOnly, cliente recebe apenas success e user. */
export interface LoginResponse {
  success: boolean;
  message?: string;
  user: {
    id: number;
    nome: string;
    usuario: string;
    usuario_grupo_id: string;
    setor: string;
  };
  /** Códigos de permissão RBAC (`permissions.code`) após sync com o Postgres. */
  permissions?: string[];
  /** Espelho local em `app_users`. */
  appUser?: AppUserSummary;
  error?: string;
}

export async function login({
  usuario,
  senha,
}: LoginParams): Promise<LoginResponse> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usuario,
      senha,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.log(error);
  }

  return await response.json();
}
