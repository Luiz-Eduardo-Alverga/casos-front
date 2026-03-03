import { clearAuthData } from '@/lib/auth'

/**
 * Wrapper para fetch que trata automaticamente erros 401 (token inválido)
 * Limpa os dados de autenticação e redireciona para /login
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init)

  // Se for 401, limpa autenticação e redireciona
  if (response.status === 401) {
    clearAuthData()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  return response
}
