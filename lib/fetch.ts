import { clearAuthData, getToken, saveToken } from '@/lib/auth'

/**
 * Tenta renovar o token via endpoint de refresh (fetch direto para evitar recursão).
 * Retorna o novo token se sucesso, null se falhar.
 */
async function tryRefreshToken(): Promise<string | null> {
  const token = getToken()
  if (!token) return null

  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data?.authorization?.token) return null

  saveToken(data.authorization.token)
  return data.authorization.token
}

/**
 * Mescla o header Authorization em um RequestInit existente (sem usar fetchWithAuth).
 */
function mergeAuthHeader(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  return { ...init, headers }
}

/**
 * Wrapper para fetch que trata automaticamente erros 401 (token inválido).
 * Em 401: tenta refresh uma vez, repete a requisição com o novo token;
 * se refresh falhar ou a nova requisição ainda retornar 401, limpa auth e redireciona para /login.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let response = await fetch(input, init)

  if (response.status === 401) {
    const newToken = await tryRefreshToken()
    if (newToken) {
      const retryInit = mergeAuthHeader(init, newToken)
      response = await fetch(input, retryInit)
    }
    if (response.status === 401) {
      clearAuthData()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  return response
}
