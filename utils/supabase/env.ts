/**
 * Chave pública: use NEXT_PUBLIC_SUPABASE_ANON_KEY (JWT anon) ou,
 * se o painel só mostrar a publishable, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.
 */
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('Defina NEXT_PUBLIC_SUPABASE_URL no .env.local')
  }
  return url
}

export function getSupabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  if (!key) {
    throw new Error(
      'Defina NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY no .env.local'
    )
  }
  return key
}
