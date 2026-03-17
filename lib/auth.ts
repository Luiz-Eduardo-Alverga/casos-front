export interface User {
  id: number;
  nome: string;
  usuario: string;
  usuario_grupo_id: string;
  setor: string;
}

/** Token não é mais exposto ao cliente — fica apenas em cookie HttpOnly no servidor. */
const USER_KEY = "@casos:user";

/** Chave do produto selecionado no Painel (ordem). Removida em clearAuthData(). */
export const PAINEL_PRODUTO_ORDEM_KEY = "@casos:painel:produto-ordem";

/**
 * Salva apenas o user no cliente (após login). O token é armazenado em cookie HttpOnly pela API.
 */
export function saveAuthData(data: { user: User }) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
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
    localStorage.removeItem(PAINEL_PRODUTO_ORDEM_KEY);
  }
}

/** Considera autenticado se há user salvo (cookie é validado nas requisições ao servidor). */
export function isAuthenticated(): boolean {
  return getUser() !== null;
}
