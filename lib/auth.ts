export interface User {
  id: number;
  nome: string;
  usuario: string;
  usuario_grupo_id: string;
  setor: string;
}

/** Registro local (`app_users`) retornado no login/sync. */
export interface AppUserSummary {
  id: string;
  legacyUserId: number;
  email: string;
  nome: string;
  setor: string;
  usuarioGrupoId: string;
}

/** Token não é mais exposto ao cliente — fica apenas em cookie HttpOnly no servidor. */
const USER_KEY = "@casos:user";

const PERMISSIONS_KEY = "@casos:permissions";

const APP_USER_KEY = "@casos:appUser";

/** Chave do produto selecionado no Painel (ordem). Removida em clearAuthData(). */
export const PAINEL_PRODUTO_ORDEM_KEY = "@casos:painel:produto-ordem";

/**
 * Salva user (e opcionalmente permissões / app user) no cliente após login ou sync.
 * O token fica em cookie HttpOnly pela API.
 */
export function saveAuthData(data: {
  user: User;
  permissions?: string[];
  appUser?: AppUserSummary;
}) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    if (data.permissions !== undefined) {
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(data.permissions));
    }
    if (data.appUser !== undefined) {
      localStorage.setItem(APP_USER_KEY, JSON.stringify(data.appUser));
    }
  }
}

/**
 * @deprecated Token não é mais armazenado no cliente. Mantido para compatibilidade (no-op).
 */
export function saveToken(_token: string) {
  // Token fica apenas no cookie HttpOnly; nada a fazer no cliente.
}

/**
 * No cliente o token não é acessível (está em cookie HttpOnly). Retorna sempre null.
 * Use apenas para checagens no client; a autenticação real é feita via cookie nas rotas API.
 */
export function getToken(): string | null {
  return null;
}

export function getUser(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Lista de códigos de permissão do RBAC local; `null` se ainda não sincronizado. */
export function getPermissions(): string[] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PERMISSIONS_KEY);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : null;
  } catch {
    return null;
  }
}

export function getAppUser(): AppUserSummary | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(APP_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppUserSummary;
  } catch {
    return null;
  }
}

/** Retorna user se existir (autenticação considerada válida se temos user + cookie no servidor). */
export function getAuthData(): { user: User } | null {
  const user = getUser();
  if (user) return { user };
  return null;
}

/** Limpa dados locais e deve ser seguido de chamada a POST /api/auth/logout para limpar o cookie. */
export function clearAuthData() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
    localStorage.removeItem(APP_USER_KEY);
    localStorage.removeItem(PAINEL_PRODUTO_ORDEM_KEY);
  }
}

/** Considera autenticado se há user salvo (cookie é validado nas requisições ao servidor). */
export function isAuthenticated(): boolean {
  return getUser() !== null;
}
