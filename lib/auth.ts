export interface User {
  id: number;
  nome: string;
  usuario: string;
  usuario_grupo_id: string;
  setor: string;
}

interface AuthData {
  token: string;
  user: User;
}

const TOKEN_KEY = '@casos:token';
const USER_KEY = '@casos:user';

export function saveAuthData(data: { authorization: { token: string }, user: User }) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, data.authorization.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }
  }
  return null;
}

export function getAuthData(): AuthData | null {
  const token = getToken();
  const user = getUser();
  
  if (token && user) {
    return { token, user };
  }
  
  return null;
}

export function clearAuthData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null && getUser() !== null;
}
