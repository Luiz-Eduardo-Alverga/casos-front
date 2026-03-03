import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Interceptor de resposta para tratar erros 401 (token inválido)
// Nota: O redirecionamento é tratado no cliente via fetchWithAuth
// Este interceptor apenas propaga o erro corretamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Propaga o erro para que possa ser tratado nas rotas da API
    // O tratamento de 401 e redirecionamento é feito no cliente via fetchWithAuth
    return Promise.reject(error)
  }
)

export const apiAssistant = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ASSISTANT_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})


