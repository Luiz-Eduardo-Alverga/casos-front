import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export const apiAssistant = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ASSISTANT_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})


